from pathlib import Path
import pymupdf4llm

PDF_DIR = Path("resources/pdfs")
MARKDOWN_DIR = Path("resources/markdown")

# Tự tạo thư mục markdown nếu chưa có
MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)


def convert_pdf_to_markdown(pdf_path: Path) -> str:
    return pymupdf4llm.to_markdown(str(pdf_path))


def convert_all_pdfs():
    pdf_files = list(PDF_DIR.glob("*.pdf"))

    if not pdf_files:
        print("Không tìm thấy file PDF nào.")
        return

    for pdf_file in pdf_files:
        print(f"Đang xử lý: {pdf_file.name}")

        markdown_content = convert_pdf_to_markdown(pdf_file)

        output_file = MARKDOWN_DIR / f"{pdf_file.stem}.md"

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(markdown_content)

        print(f"Đã tạo: {output_file.name}")

    print("Hoàn tất chuyển đổi tất cả PDF sang Markdown.")
