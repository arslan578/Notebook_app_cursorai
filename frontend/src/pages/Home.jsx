import { useState, useEffect } from "react";
import { notesAPI } from "../api";
import Note from "../components/Note";
import "../styles/Home.css";
import Header from "../components/Header";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = async () => {
        try {
            const res = await notesAPI.getAll();
            setNotes(res.data);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to fetch notes");
        }
    };

    const deleteNote = async (id) => {
        try {
            await notesAPI.delete(id);
            alert("Note deleted!");
            getNotes();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to delete note");
        }
    };

    const createNote = async (e) => {
        e.preventDefault();
        try {
            await notesAPI.create({ content, title });
            alert("Note created!");
            setContent("");
            setTitle("");
            getNotes();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create note");
        }
    };

    return (
        <div>
            <Header />
            <div className="home">
                <form onSubmit={createNote}>
                    <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <button type="submit">Create Note</button>
            </form>

            <div className="notes">
                {notes.map((note) => (
                    <Note
                        key={note.id}
                        note={note}
                        onDelete={() => deleteNote(note.id)}
                    />
                ))}
            </div>
        </div>
        </div>
    );
}

export default Home;