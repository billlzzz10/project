import google.generativeai as genai
from transformers import AutoTokenizer, AutoModel
import torch
import os
from flask import current_app

class AIService:
    def __init__(self):
        self._gemini_model = None
        self._hf_tokenizer = None
        self._hf_model = None
    
    @property
    def gemini_model(self):
        if self._gemini_model is None:
            api_key = current_app.config.get('GOOGLE_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self._gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        return self._gemini_model

    @property
    def hf_tokenizer(self):
        if self._hf_tokenizer is None:
            self._load_huggingface_model()
        return self._hf_tokenizer

    @property
    def hf_model(self):
        if self._hf_model is None:
            self._load_huggingface_model()
        return self._hf_model

    def _load_huggingface_model(self):
        """Load Hugging Face model for embeddings"""
        try:
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
            self._hf_tokenizer = AutoTokenizer.from_pretrained(model_name)
            self._hf_model = AutoModel.from_pretrained(model_name)
        except Exception as e:
            print(f"Error loading Hugging Face model: {e}")
    
    def generate_with_gemini(self, prompt, context=None):
        """Generate response using Google Gemini"""
        if not self.gemini_model:
            return {"error": "Gemini API key not configured"}
        
        try:
            if context:
                full_prompt = f"Context: {context}\n\nQuestion: {prompt}"
            else:
                full_prompt = prompt
                
            response = self.gemini_model.generate_content(full_prompt)
            return {"response": response.text}
        except Exception as e:
            return {"error": f"Gemini generation error: {str(e)}"}
    
    def get_embeddings(self, text):
        """Get embeddings using Hugging Face model"""
        if not self.hf_model or not self.hf_tokenizer:
            return None
            
        try:
            inputs = self.hf_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            with torch.no_grad():
                outputs = self.hf_model(**inputs)
                embeddings = outputs.last_hidden_state.mean(dim=1)
            return embeddings.numpy()
        except Exception as e:
            print(f"Error getting embeddings: {e}")
            return None
    
    def generate_prompt(self, task_description, examples=None):
        """Generate optimized prompt using AI"""
        prompt_template = f"""
        Create an optimized prompt for the following task: {task_description}
        
        The prompt should be:
        1. Clear and specific
        2. Include relevant context
        3. Specify desired output format
        4. Be effective for AI models
        
        {"Examples to consider: " + str(examples) if examples else ""}
        
        Return only the optimized prompt:
        """
        
        return self.generate_with_gemini(prompt_template)
    
    def generate_tool_code(self, tool_description, language="python"):
        """Generate tool code automatically"""
        code_prompt = f"""
        Generate {language} code for a tool that: {tool_description}
        
        Requirements:
        1. Include proper error handling
        2. Add docstrings and comments
        3. Follow best practices
        4. Make it modular and reusable
        
        Return only the code:
        """
        
        return self.generate_with_gemini(code_prompt)

