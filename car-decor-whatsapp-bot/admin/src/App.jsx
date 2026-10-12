import { useEffect, useState } from "react";

function App() {
  const [questions, setQuestions] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");

  const loadQuestions = () => {
    fetch("http://localhost:8000/api/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // ADD / EDIT
  const saveQuestion = async (e) => {
    e.preventDefault();

    const url = editId
      ? `http://localhost:8000/api/questions/${editId}`
      : "http://localhost:8000/api/questions";

    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        answer,
        keywords,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(
        editId
          ? "Question updated successfully!"
          : "Question added successfully!"
      );

      clearForm();
      loadQuestions();
    } else {
      alert(data.error);
    }
  };

  // EDIT
  const editQuestion = (item) => {
    setEditId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setKeywords(item.keywords);
    setShowForm(true);
  };

  // DELETE
  const deleteQuestion = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmDelete) return;

    const response = await fetch(
      `http://localhost:8000/api/questions/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Question deleted successfully!");
      loadQuestions();
    } else {
      alert(data.error);
    }
  };

  const clearForm = () => {
    setQuestion("");
    setAnswer("");
    setKeywords("");
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Car Decor Bot - Admin Panel</h1>

      <button onClick={() => setShowForm(true)}>
        Add Question
      </button>

      {showForm && (
        <form
          onSubmit={saveQuestion}
          style={{
            marginTop: "20px",
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            maxWidth: "500px",
          }}
        >
          <h2>{editId ? "Edit Question" : "Add Question"}</h2>

          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <textarea
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <input
            type="text"
            placeholder="Keywords (comma separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />

          <button type="submit">
            {editId ? "Update Question" : "Save Question"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      )}

      <h2>Questions & Answers</h2>

      {questions.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{item.question}</h3>

          <p>
            <b>Answer:</b> {item.answer}
          </p>

          <p>
            <b>Keywords:</b> {item.keywords}
          </p>

          <button onClick={() => editQuestion(item)}>
            Edit
          </button>

          <button
            onClick={() => deleteQuestion(item.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;