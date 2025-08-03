import os
import json
import numpy as np
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from huggingface_hub import InferenceClient

from ..models import db, RAGDocument, UploadedFile
from ..config import Config
from flask import current_app


class EnhancedRAGService:
    def __init__(self):
        # Initialize Pinecone
        self.pinecone_api_key = current_app.config.get("PINECONE_API_KEY")
        self.pinecone_env = current_app.config.get("PINECONE_ENV")
        missing_vars = []
        if not self.pinecone_api_key:
            missing_vars.append("PINECONE_API_KEY")
        if not self.pinecone_env:
            missing_vars.append("PINECONE_ENV")
        if missing_vars:
            raise ValueError(
                f"Pinecone configuration incomplete. Please set the following environment variables: {', '.join(missing_vars)}"
            )

        self.pc = Pinecone(api_key=self.pinecone_api_key)

        # Initialize Hugging Face Inference Client
        self.hf_token = current_app.config.get("HF_TOKEN")
        if not self.hf_token:
            raise ValueError(
                "Hugging Face Token must be configured. Please set the HF_TOKEN environment variable."
            )
        self.hf_client = InferenceClient(token=self.hf_token)
        self.embedding_model = current_app.config.get(
            "EMBEDDING_MODEL", "intfloat/multilingual-e5-large"
        )
        # Get dimension from config or fallback to default (1024 for multilingual-e5-large)
        self.dimension = int(current_app.config.get("EMBEDDING_DIMENSION", 1024))
        # Get index name from config or fallback to default
        self.index_name = current_app.config.get("PINECONE_INDEX_NAME", "rag-index")

        # Set index name from config or use default
        self.index_name = current_app.config.get("PINECONE_INDEX_NAME", "rag-index")
        self._init_pinecone_index()

    def _init_pinecone_index(self):
        """Check if Pinecone index exists, and create it if it doesn't."""
        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=current_app.config.get("PINECONE_CLOUD", "gcp"),
                    region=current_app.config.get("PINECONE_REGION", "asia-southeast1"),
                ),
            )
        self.index = self.pc.Index(self.index_name)

    def _embed(self, text: str, mode: str = "passage") -> List[float]:
        """Generate embedding for a text using Hugging Face Inference API."""
        formatted_text = f"{mode}: {text}"
        response = self.hf_client.feature_extraction(
            model=self.embedding_model, inputs=[formatted_text]
        )
        # The response is a nested list, we take the first element's mean
        vector = np.mean(response[0], axis=0).tolist()
        return vector

    def add_document(
        self, content: str, user_id: int, source_type: str, source_id: str, title: str
    ) -> RAGDocument:
        """
        Adds a document to the RAG system:
        1. Creates an embedding.
        2. Saves the document content to the main DB.
        3. Upserts the vector to Pinecone.
        """
        # 1. Save document to main DB to get a unique ID
        rag_doc = RAGDocument(
            user_id=user_id,
            source_type=source_type,
            source_id=source_id,
            title=title,
            content=content,
        )
        db.session.add(rag_doc)
        db.session.commit()

        # 2. Create embedding
        vector = self._embed(content, mode="passage")

        # 3. Upsert to Pinecone
        self.index.upsert(
            vectors=[
                {
                    "id": str(rag_doc.id),
                    "values": vector,
                    "metadata": {
                        "user_id": user_id,
                        "source_type": source_type,
                        "title": title,
                    },
                }
            ]
        )

        return rag_doc

    def semantic_search(
        self, query: str, user_id: int, top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs semantic search:
        1. Creates a query embedding.
        2. Queries Pinecone for similar vectors.
        3. Fetches full document content from the main DB.
        """
        # 1. Create query embedding
        query_vector = self._embed(query, mode="query")

        # 2. Query Pinecone
        query_results = self.index.query(
            vector=query_vector,
            top_k=top_k,
            filter={"user_id": user_id},
            include_metadata=True,
        )

        # 3. Fetch full documents from DB
        results = []
        if query_results.matches:
            doc_ids = [int(match.id) for match in query_results.matches]
            db_docs = RAGDocument.query.filter(RAGDocument.id.in_(doc_ids)).all()

            # Create a map for quick lookup
            doc_map = {doc.id: doc for doc in db_docs}

            for match in query_results.matches:
                doc_id = int(match.id)
                if doc_id in doc_map:
                    doc = doc_map[doc_id]
                    result = doc.to_dict()
                    result["similarity_score"] = match.score
                    results.append(result)

        return results

    def get_rag_context(
        self, query: str, user_id: int, max_context_length: int = 4000
    ) -> str:
        """Get relevant context for RAG-enhanced chat."""
        search_results = self.semantic_search(query, user_id, top_k=3)

        context = ""
        for result in search_results:
            content_to_add = f"Document: {result.get('title', 'Unknown')}\nContent: {result.get('content', '')}\n\n"
            if len(context) + len(content_to_add) <= max_context_length:
                context += content_to_add
            else:
                break

        return context


def get_rag_service():
    """Get or create EnhancedRAGService instance using Flask's app context."""
    if "enhanced_rag_service" not in current_app.extensions:
        current_app.extensions["enhanced_rag_service"] = EnhancedRAGService()
    return current_app.extensions["enhanced_rag_service"]
