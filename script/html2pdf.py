import pdfkit

files = ["../cv.html"]

for f in files:
    pdfkit.from_file(f, f.split('.')[0]+".pdf")
