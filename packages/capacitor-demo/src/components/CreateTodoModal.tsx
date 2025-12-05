import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Send, User, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';
import { Camera, CameraResultType } from '@capacitor/camera';

interface CreateTodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    parentId?: Id<"todos">;
}

export function CreateTodoModal({ isOpen, onClose, userEmail, parentId }: CreateTodoModalProps) {
    const createTodo = useMutation(api.todos.create);
    const generateUploadUrl = useMutation(api.todos.generateUploadUrl);

    const [content, setContent] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Base64 or Blob URL for preview
    const [imageBlob, setImageBlob] = useState<Blob | null>(null); // Actual blob to upload

    if (!isOpen) return null;

    const handleCamera = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
            });

            if (image.webPath) {
                // Fetch blob from webPath
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                setImageBlob(blob);
                setSelectedImage(image.webPath);
            }
        } catch (error) {
            console.error("Camera error:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !assigneeEmail) return;

        setIsSubmitting(true);
        try {
            let imageStorageId: string | undefined;

            // Upload image if exists
            if (imageBlob) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": imageBlob.type },
                    body: imageBlob,
                });
                const { storageId } = await result.json();
                imageStorageId = storageId;
            }

            await createTodo({
                userEmail,
                content,
                assigneeEmail,
                parentId,
                images: imageStorageId ? [imageStorageId] : undefined,
            });

            onClose();
            // Reset form
            setContent('');
            setAssigneeEmail('');
            setSelectedImage(null);
            setImageBlob(null);
        } catch (error) {
            console.error("Failed to create todo", error);
            alert("Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out translate-y-0 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {parentId ? 'New Subtask' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Task Details</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What needs to be done?"
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Assign To (Email)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={assigneeEmail}
                                onChange={(e) => setAssigneeEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Attachments</label>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <button
                                type="button"
                                onClick={handleCamera}
                                className="flex-shrink-0 w-20 h-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-all"
                            >
                                <ImageIcon className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-medium">Add Image</span>
                            </button>

                            {selectedImage && (
                                <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setImageBlob(null);
                                        }}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                Create Task <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
