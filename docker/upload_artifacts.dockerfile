FROM python:3.5-slim

COPY requirements/pipeline.txt .

RUN pip install -r pipeline.txt

COPY .buildkite/upload_artifacts.py .

# Will not run without having a populated /dist directory.
# Assumes bind mount on run
CMD python upload_artifacts.py
