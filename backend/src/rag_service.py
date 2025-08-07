import faiss
import numpy as np
import os
import json
import pickle
from typing import List, Dict, Any
from src.services.ai_service import AIService


class RAGService:
    def __init__(self):
        self.ai_service = AIService()
        self.index = None
        self.documents = []
        self.embeddings_dim = 384  # dimension for all-MiniLM-L6-v2
        self.index_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "data", "vector_db"
        )
        self._ensure_data_dir()
        self._load_or_create_index()

    def _ensure_data_dir(self):
        """Ensure data directory exists"""
        os.makedirs(self.index_path, exist_ok=True)

    def _load_or_create_index(self):
        """Load existing index or create new one"""
        index_file = os.path.join(self.index_path, "faiss_index.bin")
        docs_file = os.path.join(self.index_path, "documents.pkl")

        if os.path.exists(index_file) and os.path.exists(docs_file):
            try:
                self.index = faiss.read_index(index_file)
                with open(docs_file, "rb") as f:
                    self.documents = pickle.load(f)
                print(f"Loaded existing index with {len(self.documents)} documents")
            except Exception as e:
                print(f"Error loading index: {e}")
                self._create_new_index()
        else:
            self._create_new_index()

    def _create_new_index(self):
        """Create new FAISS index"""
        self.index = faiss.IndexFlatL2(self.embeddings_dim)
        self.documents = []
        print("Created new FAISS index")

    def add_document(self, text: str, metadata: Dict[str, Any] = None):
        """Add document to the vector database"""
        if not text.strip():
            return False

        try:
            # Get embeddings
            embeddings = self.ai_service.get_embeddings(text)
            if embeddings is None:
                return False

            # Add to index
            embeddings_flat = embeddings.flatten().astype("float32")
            self.index.add(np.array([embeddings_flat]))

            # Store document
            doc_data = {
                "text": text,
                "metadata": metadata or {},
                "id": len(self.documents),
            }
            self.documents.append(doc_data)

            # Save index
            self._save_index()
            return True

        except Exception as e:
            print(f"Error adding document: {e}")
            return False

    def add_documents_batch(self, documents: List[Dict[str, Any]]):
        """Add multiple documents at once"""
        success_count = 0
        for doc in documents:
            text = doc.get("text", "")
            metadata = doc.get("metadata", {})
            if self.add_document(text, metadata):
                success_count += 1
        return success_count

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if self.index.ntotal == 0:
            return []

        try:
            # Get query embeddings
            query_embeddings = self.ai_service.get_embeddings(query)
            if query_embeddings is None:
                return []

            # Search
            query_flat = query_embeddings.flatten().astype("float32")
            distances, indices = self.index.search(np.array([query_flat]), k)

            # Return results
            results = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.documents):
                    doc = self.documents[idx].copy()
                    doc["similarity_score"] = float(
                        1 / (1 + distance)
                    )  # Convert distance to similarity
                    results.append(doc)

            return results

        except Exception as e:
            print(f"Error searching: {e}")
            return []

    def generate_answer(self, query: str, k: int = 3) -> Dict[str, Any]:
        """Generate answer using RAG"""
        # Search for relevant documents
        relevant_docs = self.search(query, k)

        if not relevant_docs:
            return {
                "answer": "ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล",
                "sources": [],
                "confidence": 0.0,
            }

        # Prepare context
        context_parts = []
        sources = []

        for doc in relevant_docs:
            context_parts.append(doc["text"])
            sources.append(
                {
                    "text": (
                        doc["text"][:200] + "..."
                        if len(doc["text"]) > 200
                        else doc["text"]
                    ),
                    "metadata": doc["metadata"],
                    "similarity_score": doc["similarity_score"],
                }
            )

        context = "\n\n".join(context_parts)

        # Generate answer
        answer_result = self.ai_service.generate_with_gemini(query, context)

        if "error" in answer_result:
            return {
                "answer": f"เกิดข้อผิดพลาด: {answer_result['error']}",
                "sources": sources,
                "confidence": 0.0,
            }

        # Calculate confidence based on similarity scores
        avg_similarity = sum(doc["similarity_score"] for doc in relevant_docs) / len(
            relevant_docs
        )

        return {
            "answer": answer_result["response"],
            "sources": sources,
            "confidence": avg_similarity,
        }

    def _save_index(self):
        """Save index and documents to disk"""
        try:
            index_file = os.path.join(self.index_path, "faiss_index.bin")
            docs_file = os.path.join(self.index_path, "documents.pkl")

            faiss.write_index(self.index, index_file)
            with open(docs_file, "wb") as f:
                pickle.dump(self.documents, f)

        except Exception as e:
            print(f"Error saving index: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get RAG system statistics"""
        return {
            "total_documents": len(self.documents),
            "index_size": self.index.ntotal if self.index else 0,
            "embeddings_dimension": self.embeddings_dim,
        }

    def clear_index(self):
        """Clear all documents from index"""
        self._create_new_index()
        self._save_index()
        return True
