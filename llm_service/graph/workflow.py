from langgraph.graph import StateGraph
from llm_service.graph.state import LLMState
from llm_service.graph.nodes import (
    classify_node,
    food_parser_node,
    exercise_parser_node,
    calculator_node,
)
from llm_service.graph.router import route_by_intent


def build_graph():
    graph = StateGraph(LLMState)

    graph.add_node("classifier", classify_node)
    graph.add_node("food_parser", food_parser_node)
    graph.add_node("exercise_parser", exercise_parser_node)
    graph.add_node("calculator", calculator_node)

    graph.set_entry_point("classifier")

    graph.add_conditional_edges(
        "classifier",
        route_by_intent,
        {
            "food": "food_parser",
            "exercise": "exercise_parser",
            "mixed": "food_parser",
        },
    )

    graph.add_edge("food_parser", "calculator")
    graph.add_edge("exercise_parser", "calculator")

    return graph.compile()