# Official Python 3.12 Linux/amd64 image, resolved 2026-10-25.
FROM python:3.12-slim-bookworm@sha256:57d96f71de145a98e7ceca18ee4ade77bba4103a33a72dfaea026b23625c6bf0
ENV PYTHONDONTWRITEBYTECODE=1 PIP_DISABLE_PIP_VERSION_CHECK=1 \
    LITELLM_LOCAL_MODEL_COST_MAP=True HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1
WORKDIR /opt/scan
COPY requirements.txt profile.json worker.py ./
RUN python -m pip install --no-cache-dir --only-binary=:all: --require-hashes -r requirements.txt \
    && python -m pip check
USER 65534:65534
ENTRYPOINT ["python", "-I", "/opt/scan/worker.py"]
