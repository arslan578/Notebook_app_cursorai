import "../styles/Note.css";

function Note({ note, onDelete }) {
    return (
        <div className="note">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={onDelete}>Delete</button>
        </div>
    );
}

export default Note;