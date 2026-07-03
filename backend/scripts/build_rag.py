from app.rag import chunker, embedder, vector_store
from scripts.pdf_to_markdown import convert_all_pdfs
import pathlib

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent

MARKDOWN_DIR = BASE_DIR / "resources" / "markdown"

def build_rag():
    convert_all_pdfs()
    markdown_files = list(MARKDOWN_DIR.glob("*.md"))
    if not markdown_files:
        print("Không tìm thấy file Markdown nào để xây dựng RAG.")
        return
    for md_file in markdown_files:
        print(f"Đang xử lý: {md_file.name}")
        with open(md_file, "r", encoding="utf-8") as f:
            markdown_texts = f.read()
        chunks = chunker.split_markdown(markdown_texts)
        print(f"Đã chunk Markdown {md_file.name} thành các đoạn nhỏ.")
        embeddings = embedder.embed_chunks(chunks)
        vector_store.save(
            source_file=md_file.name,
            chunks=chunks,
            embeddings=embeddings
        )
        print(f"Đã lưu embeddings cho file: {md_file.name}")

if __name__ == "__main__":
    build_rag()

