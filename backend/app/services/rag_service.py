"""RAG (Retrieval Augmented Generation) service for knowledge-based responses."""

import json
from pathlib import Path
from typing import Optional

import chromadb
from sentence_transformers import SentenceTransformer


class RAGService:
    """Service for RAG-based knowledge retrieval and response generation."""

    def __init__(self):
        self._embedder: Optional[SentenceTransformer] = None
        self._chroma_client: Optional[chromadb.PersistentClient] = None
        self._collection = None
        self._knowledge_base = None
        self._initialized = False

    def _get_embedder(self) -> SentenceTransformer:
        """Get or create sentence transformer model."""
        if self._embedder is None:
            # Use a lightweight but effective model
            self._embedder = SentenceTransformer('all-MiniLM-L6-v2')
        return self._embedder

    def _get_chroma_client(self) -> chromadb.PersistentClient:
        """Get or create ChromaDB client."""
        if self._chroma_client is None:
            persist_dir = Path(__file__).parent.parent / "data" / "chroma_db"
            persist_dir.mkdir(parents=True, exist_ok=True)
            self._chroma_client = chromadb.PersistentClient(path=str(persist_dir))
        return self._chroma_client

    def _load_knowledge_base(self) -> dict:
        """Load knowledge base from JSON file."""
        if self._knowledge_base is None:
            kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"
            if kb_path.exists():
                with open(kb_path, 'r', encoding='utf-8') as f:
                    self._knowledge_base = json.load(f)
            else:
                self._knowledge_base = {}
        return self._knowledge_base

    def _prepare_documents(self) -> list[dict]:
        """Prepare documents from knowledge base for indexing."""
        kb = self._load_knowledge_base()
        documents = []

        # Company info
        if "company_info" in kb:
            info = kb["company_info"]
            contact = info.get('contact', {})
            documents.append({
                "id": "company_info",
                "content": f"Company: {info.get('name', '')}. {info.get('description', '')}. Contact email: {contact.get('email', '')}. Phone: {contact.get('phone', '')}. Address: {contact.get('address', '')}. Working hours: {info.get('working_hours', '')}",
                "metadata": {"type": "company_info"}
            })

        # FAQs
        for i, faq in enumerate(kb.get("faqs", [])):
            documents.append({
                "id": f"faq_{i}",
                "content": f"Question: {faq['question']}\nAnswer: {faq['answer']}",
                "metadata": {"type": "faq", "question": faq["question"]}
            })

        # Destinations
        for dest in kb.get("destinations", []):
            highlights = ", ".join(dest.get("highlights", []))
            best_for = ", ".join(dest.get("best_for", []))
            documents.append({
                "id": f"dest_{dest['name'].lower().replace(' ', '_')}",
                "content": f"Destination: {dest['name']} ({dest['region']}). {dest['description']} Highlights: {highlights}. Best for: {best_for}.",
                "metadata": {"type": "destination", "name": dest["name"], "region": dest["region"]}
            })

        # Activities
        for activity in kb.get("activities", []):
            documents.append({
                "id": f"activity_{activity['name'].lower().replace(' ', '_')}",
                "content": f"Activity: {activity['name']} in {activity['location']}. {activity['description']} Price: {activity['price_range']}. Duration: {activity['duration']}. Difficulty: {activity['difficulty']}.",
                "metadata": {"type": "activity", "name": activity["name"], "location": activity["location"]}
            })

        # Policies
        policies = kb.get("policies", {})
        if policies:
            policy_text = ". ".join([f"{k.replace('_', ' ').title()}: {v}" for k, v in policies.items()])
            documents.append({
                "id": "policies",
                "content": f"Booking Policies: {policy_text}",
                "metadata": {"type": "policy"}
            })

        # Seasonal tips
        for season, info in kb.get("seasonal_tips", {}).items():
            events = ", ".join(info.get("events", []))
            documents.append({
                "id": f"season_{season}",
                "content": f"Season: {season.title()} ({info['months']}). Weather: {info['weather']}. Tips: {info['tips']}. Events: {events}.",
                "metadata": {"type": "seasonal_tip", "season": season}
            })

        return documents

    def initialize(self, force_rebuild: bool = False) -> bool:
        """Initialize RAG system with knowledge base."""
        try:
            client = self._get_chroma_client()
            collection_name = "nz_tours_knowledge"

            if force_rebuild:
                try:
                    client.delete_collection(collection_name)
                except:
                    pass
                self._collection = None

            # Try to get existing collection
            try:
                self._collection = client.get_collection(name=collection_name)
                if self._collection.count() > 0 and not force_rebuild:
                    self._initialized = True
                    print(f"RAG loaded with {self._collection.count()} documents")
                    return True
            except:
                pass

            # Create new collection with custom embedding function
            embedder = self._get_embedder()

            class EmbeddingFunction:
                def __init__(self, model):
                    self.model = model

                def __call__(self, input):
                    return self.model.encode(input).tolist()

            self._collection = client.create_collection(
                name=collection_name,
                metadata={"description": "NZ Tours knowledge base"}
            )

            # Prepare and index documents
            documents = self._prepare_documents()

            if documents:
                ids = [doc["id"] for doc in documents]
                contents = [doc["content"] for doc in documents]
                metadatas = [doc["metadata"] for doc in documents]
                embeddings = embedder.encode(contents).tolist()

                self._collection.add(
                    ids=ids,
                    documents=contents,
                    metadatas=metadatas,
                    embeddings=embeddings
                )

            self._initialized = True
            print(f"RAG initialized with {len(documents)} documents")
            return True

        except Exception as e:
            print(f"Error initializing RAG: {e}")
            import traceback
            traceback.print_exc()
            return False

    def retrieve(self, query: str, n_results: int = 5) -> list[dict]:
        """Retrieve relevant documents for a query."""
        if not self._initialized:
            self.initialize()

        if self._collection is None:
            return []

        try:
            embedder = self._get_embedder()
            query_embedding = embedder.encode(query).tolist()

            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )

            retrieved = []
            if results and results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    retrieved.append({
                        "content": doc,
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else 0
                    })

            return retrieved

        except Exception as e:
            print(f"Error retrieving documents: {e}")
            return []

    def get_context_for_query(self, query: str, max_tokens: int = 2000) -> str:
        """Get formatted context for a query to be used in LLM prompt."""
        retrieved = self.retrieve(query, n_results=5)

        if not retrieved:
            return "No specific information found in knowledge base."

        context_parts = []
        current_length = 0

        for doc in retrieved:
            content = doc["content"]
            # Rough token estimate (4 chars per token)
            if current_length + len(content) / 4 > max_tokens:
                break
            context_parts.append(content)
            current_length += len(content) / 4

        return "\n\n".join(context_parts)

    def add_document(self, doc_id: str, content: str, metadata: dict = None) -> bool:
        """Add a new document to the knowledge base."""
        if not self._initialized:
            self.initialize()

        if self._collection is None:
            return False

        try:
            embedder = self._get_embedder()
            embedding = embedder.encode(content).tolist()

            self._collection.add(
                ids=[doc_id],
                documents=[content],
                metadatas=[metadata or {}],
                embeddings=[embedding]
            )
            return True

        except Exception as e:
            print(f"Error adding document: {e}")
            return False


# Singleton instance
rag_service = RAGService()
