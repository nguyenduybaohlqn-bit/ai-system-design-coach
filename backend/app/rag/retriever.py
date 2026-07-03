import chromadb
from app.rag.embedder import embed_chunks

client = chromadb.PersistentClient(path="resources/chroma_db")
collection = client.get_collection("system_design")

def retrieve(query: str, top_k: int = 5) -> list[dict]:
    # Embed câu hỏi
    query_embedding = embed_chunks([query])[0]

    # Tìm kiếm
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    # Format kết quả
    chunks = []
    for i in range(len(results["ids"][0])):
        chunks.append({
            "text"      : results["documents"][0][i],
            "source"    : results["metadatas"][0][i]["source"],
            "similarity": round(results["distances"][0][i], 4)
        })
        print(f"Đã tìm thấy chunk: {chunks[-1]['text'][:30]}... từ file: {chunks[-1]['source']} với độ tương đồng: {chunks[-1]['similarity']}")

    return chunks

