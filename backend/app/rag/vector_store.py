import chromadb

client = chromadb.PersistentClient(path="resources/chroma_db")

collection = client.get_or_create_collection(
    name="system_design"
)


def save(source_file: str,
         chunks: list[str],
         embeddings: list[list[float]]):
    
    print(f"Đang lưu embeddings vào ChromaDB cho file")
    ids = []
    metadatas = []

    for i in range(len(chunks)):
        ids.append(f"{source_file}_{i}")

        metadatas.append({
            "source": source_file,
            "chunk_index": i
        })

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )