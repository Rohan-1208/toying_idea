from bson import ObjectId


def normalize_id(document: dict | None) -> dict | None:
    if document is None:
        return None
    doc = {}
    for k, v in document.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        else:
            doc[k] = v
    if "_id" in doc:
        doc["id"] = doc["_id"]
        del doc["_id"]
    return doc


def normalize_ids(documents: list[dict]) -> list[dict]:
    return [normalize_id(d) for d in documents if d is not None]


def object_id(value: str) -> ObjectId:
    return ObjectId(value)
