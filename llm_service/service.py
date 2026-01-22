from .graph.workflow import build_graph

_graph = None

def process_user_input(text: str):
    global _graph

    if _graph is None:
        _graph = build_graph()

    state = {
        "input": text,
        "intent": None,
        "parsed_data": None,
        "nutrition": None
    }

    return _graph.invoke(state)