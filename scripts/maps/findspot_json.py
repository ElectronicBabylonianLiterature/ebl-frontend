from __future__ import annotations

import json
import math
from typing import Any, NoReturn


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise RuntimeError("Map JSON contains a duplicate object key")
        result[key] = value
    return result


def _invalid_constant(value: str) -> NoReturn:
    raise RuntimeError("Map JSON contains a non-finite number")


def _finite_float(value: str) -> float:
    number = float(value)
    if not math.isfinite(number):
        raise RuntimeError("Map JSON contains a non-finite number")
    return number


def load_json(contents: str | bytes) -> Any:
    return json.loads(
        contents,
        object_pairs_hook=_unique_object,
        parse_constant=_invalid_constant,
        parse_float=_finite_float,
    )
