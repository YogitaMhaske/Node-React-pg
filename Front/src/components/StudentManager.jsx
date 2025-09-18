import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function StudentManager() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", mark: "" });
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [editId, setEditId] = useState(null);
    const limit = 5;
    const [totalPages, setTotalPages] = useState(1);

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`http://localhost:4001/api/students?page=${page}&limit=${limit}`);
            setStudents(res.data.data);
            setTotalPages(Math.ceil(res.data.total / limit));
        } catch (err) {
            Swal.fire("Error", "Could not load students", "error");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "mark" && value > 100) return;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const res = await axios.put(`http://localhost:4001/api/students/${editId}`, form);
                Swal.fire("Updated", res.data.message, "success");
            } else {
                const res = await axios.post("http://localhost:4001/api/students", form);
                Swal.fire("Success", res.data.message, "success");
            }
            setForm({ name: "", email: "", phone: "", mark: "" });
            setEditId(null);
            fetchStudents();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Failed", "error");
        }
    };

    const deleteStudent = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const res = await axios.delete(`http://localhost:4001/api/students/${id}`);
                Swal.fire("Deleted!", res.data.message, "success");
                fetchStudents();
            } catch (err) {
                Swal.fire("Error", err.response?.data?.message || "Failed", "error");
            }
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "1000px" }}>
            <div className="card shadow">
                <div className="card-body">
                    <h3 className="text-center mb-4">🎓 Student Management</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Name"
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Phone"
                                    maxLength={10}
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    name="mark"
                                    value={form.mark}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Mark"
                                    min={0}
                                    max={100}
                                    required
                                />
                            </div>
                            <div className="col-md-2 text-end">
                                <button className="btn btn-success w-100">
                                    {editId ? "Update" : "Add"}
                                </button>
                            </div>
                            {editId && (
                                <div className="col-md-12 text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary mt-2"
                                        onClick={() => {
                                            setForm({ name: "", email: "", phone: "", mark: "" });
                                            setEditId(null);
                                        }}
                                    >
                                        Cancel Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>

                    <table className="table table-striped mt-4">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Mark</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length ? (
                                students.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.name}</td>
                                        <td>{s.email}</td>
                                        <td>{s.phone}</td>
                                        <td>{s.marks.map(m => m.mark).join(", ")}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => {
                                                    setForm({
                                                        name: s.name,
                                                        email: s.email,
                                                        phone: s.phone,
                                                        mark: s.marks.length ? s.marks[0].mark : "",
                                                    });
                                                    setEditId(s.id);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteStudent(s.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        No students found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <button
                                className="btn btn-outline-secondary me-2"
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                            >
                                ⏮ First
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ⬅ Prev
                            </button>
                        </div>
                        <span className="text-muted">
                            Page {page} of {totalPages}
                        </span>
                        <div>
                            <button
                                className="btn btn-outline-secondary me-2"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next ➡
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                disabled={page === totalPages}
                                onClick={() => setPage(totalPages)}
                            >
                                Last ⏭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
