import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, CheckCircle2, XCircle, ShieldCheck, AlertCircle, Plus, History, Image as ImageIcon, Loader2, ArrowLeft, Edit2 } from 'lucide-react';
import { StatusBadge, TodoStatus } from './StatusBadge';
import { TodoList } from './TodoList';
import { CreateTodoModal } from './CreateTodoModal';
import { UserAvatar } from './UserAvatar';
import { Camera, CameraResultType } from '@capacitor/camera';
import { useNavigate, useParams, Link } from 'react-router-dom';

interface TodoDetailProps {
    userEmail: string;
    onClose?: () => void;
}

export function TodoDetail({ userEmail, onClose }: TodoDetailProps) {
    const { todoId } = useParams<{ todoId: string }>();
    const navigate = useNavigate();

    const effectiveTodoId = todoId as Id<"todos">;

    const todo = useQuery(api.todos.getById, { id: effectiveTodoId });
    const subtasks = useQuery(api.todos.getSubtasks, { parentId: effectiveTodoId });
    const logs = useQuery(api.todos.getLogs, { todoId: effectiveTodoId });
    const updateStatus = useMutation(api.todos.updateStatus);
    const generateUploadUrl = useMutation(api.todos.generateUploadUrl);
    const editTodoContent = useMutation(api.todos.editTodoContent);

    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Feedback state
    const [isFeedbackMode, setIsFeedbackMode] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TodoStatus | null>(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackImage, setFeedbackImage] = useState<string | null>(null);
    const [feedbackImageBlob, setFeedbackImageBlob] = useState<Blob | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    // Edit Content State
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editContentText, setEditContentText] = useState('');

    if (!todo) return <div className="p-8 text-center">Loading...</div>;

    const isAssignee = todo.assigneeEmail === userEmail;
    const isCreator = todo.creator?.email === userEmail;

    const handleBack = () => {
        if (onClose) onClose();
        else navigate(-1);
    };

    const handleCamera = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
            });

            if (image.webPath) {
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                setFeedbackImageBlob(blob);
                setFeedbackImage(image.webPath);
            }
        } catch (error) {
            console.error("Camera error:", error);
        }
    };

    const initiateStatusChange = (status: TodoStatus) => {
        if (status === 'pending') return;
        setPendingStatus(status);
        setIsFeedbackMode(true);
        setFeedbackComment('');
        setFeedbackImage(null);
        setFeedbackImageBlob(null);
    };

    const submitStatusChange = async () => {
        if (!pendingStatus) return;

        setIsSubmittingFeedback(true);
        try {
            let imageStorageId: string | undefined;

            if (feedbackImageBlob) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": feedbackImageBlob.type },
                    body: feedbackImageBlob,
                });
                const { storageId } = await result.json();
                imageStorageId = storageId;
            }

            await updateStatus({
                userEmail,
                todoId: effectiveTodoId,
                status: pendingStatus,
                comment: feedbackComment || undefined,
                images: imageStorageId ? [imageStorageId] : undefined,
            });

            setIsFeedbackMode(false);
            setPendingStatus(null);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status: " + (error as any).message);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const handleSaveContent = async () => {
        if (!editContentText) return;
        try {
            await editTodoContent({
                userEmail,
                todoId: effectiveTodoId,
                content: editContentText,
            });
            setIsEditingContent(false);
        } catch (error) {
            console.error("Failed to edit content", error);
            alert("Failed to edit content");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-safe">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 shadow-sm px-4 py-3 flex items-center gap-3 pt-safe-top">
                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                        <span>Task Details</span>
                        <span>•</span>
                        <span>{new Date((todo as any).creationTime || (todo as any)._creationTime).toLocaleDateString()}</span>
                    </div>
                    <StatusBadge status={todo.status as TodoStatus} />
                </div>
                {isCreator && !isEditingContent && (
                    <button
                        onClick={() => {
                            setEditContentText(todo.content || (todo as any).title);
                            setIsEditingContent(true);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6 max-w-3xl mx-auto">

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Task Request</h3>

                    {isEditingContent ? (
                        <div className="space-y-3">
                            <textarea
                                value={editContentText}
                                onChange={(e) => setEditContentText(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsEditingContent(false)}
                                    className="px-4 py-2 text-slate-600 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveContent}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-900 text-lg leading-relaxed whitespace-pre-wrap">
                            {todo.content || (todo as any).title}
                        </div>
                    )}

                    {/* Attachments */}
                    {todo.imageUrls && todo.imageUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {todo.imageUrls.map((url, idx) => (
                                url && (
                                    <div
                                        key={idx}
                                        className="rounded-lg overflow-hidden border border-slate-100 aspect-video cursor-pointer"
                                        onClick={() => setFullscreenImage(url)}
                                    >
                                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {/* Edit History Indicator */}
                    {(todo as any).contentEdits?.length > 0 && (
                        <button
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="mt-3 text-xs text-slate-400 italic flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                            <History className="w-3 h-3" /> Edited {(todo as any).contentEdits.length} times
                        </button>
                    )}
                </div>

                {/* People */}
                <div className="grid grid-cols-2 gap-3">
                    <Link to={`/user/${todo.assigneeEmail}`} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                        <UserAvatar email={todo.assigneeEmail} name={todo.assignee?.name} size="sm" />
                        <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned To</span>
                            <div className="font-medium text-slate-900 truncate text-sm">{todo.assignee?.name || todo.assigneeEmail.split('@')[0]}</div>
                        </div>
                    </Link>
                    <Link to={`/user/${todo.creator?.email || "unknown"}`} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                        <UserAvatar email={todo.creator?.email || ""} name={todo.creator?.name} size="sm" />
                        <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Created By</span>
                            <div className="font-medium text-slate-900 truncate text-sm">{todo.creator?.name || todo.creator?.email?.split('@')[0] || "Unknown"}</div>
                        </div>
                    </Link>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {isAssignee && (
                            <>
                                <button
                                    onClick={() => initiateStatusChange('completed')}
                                    className="flex flex-col items-center justify-center gap-1 p-4 bg-white border border-green-100 text-green-700 rounded-2xl font-medium shadow-sm hover:bg-green-50 transition-colors"
                                >
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="text-sm">{todo.status === 'completed' ? 'Update Remark' : 'Mark Complete'}</span>
                                </button>
                                <button
                                    onClick={() => initiateStatusChange('failed')}
                                    className="flex flex-col items-center justify-center gap-1 p-4 bg-white border border-red-100 text-red-700 rounded-2xl font-medium shadow-sm hover:bg-red-50 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                    <span className="text-sm">{todo.status === 'failed' ? 'Update Remark' : 'Mark Failed'}</span>
                                </button>
                            </>
                        )}

                        {isCreator && (todo.status === 'completed' || todo.status === 'failed' || todo.status === 'approved' || todo.status === 'rejected') && (
                            <>
                                <button
                                    onClick={() => initiateStatusChange('approved')}
                                    className="flex flex-col items-center justify-center gap-1 p-4 bg-white border border-blue-100 text-blue-700 rounded-2xl font-medium shadow-sm hover:bg-blue-50 transition-colors"
                                >
                                    <ShieldCheck className="w-6 h-6" />
                                    <span className="text-sm">{todo.status === 'approved' ? 'Update Remark' : 'Approve'}</span>
                                </button>
                                <button
                                    onClick={() => initiateStatusChange('rejected')}
                                    className="flex flex-col items-center justify-center gap-1 p-4 bg-white border border-orange-100 text-orange-700 rounded-2xl font-medium shadow-sm hover:bg-orange-50 transition-colors"
                                >
                                    <AlertCircle className="w-6 h-6" />
                                    <span className="text-sm">{todo.status === 'rejected' ? 'Update Remark' : 'Reject'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Subtasks */}
                <div>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtasks</h3>
                        <button
                            onClick={() => setIsSubtaskModalOpen(true)}
                            className="text-indigo-600 text-xs font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <TodoList
                            todos={subtasks}
                            isLoading={subtasks === undefined}
                            onTodoClick={(id) => navigate(`/todo/${id}`)}
                            emptyMessage="No subtasks yet."
                        />
                    </div>
                </div>

                {/* Timeline / History */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Timeline</h3>
                    <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2">
                        {logs?.map((log) => (
                            <div key={log._id} className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 text-sm">{log.user?.name || log.user?.email.split('@')[0]}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="text-sm text-slate-600 mb-1">
                                    {log.action === 'create' ? 'created this task' :
                                        log.action === 'mark_completed' ? 'marked as completed' :
                                            log.action === 'mark_failed' ? 'marked as failed' :
                                                log.action === 'approve' ? 'approved the task' :
                                                    log.action === 'reject' ? 'rejected the task' :
                                                        log.action === 'update' ? 'updated details' : log.action}
                                </div>

                                {log.comment && (
                                    <div className="bg-slate-100 p-3 rounded-xl rounded-tl-none text-sm text-slate-800 mt-1 inline-block max-w-full">
                                        {log.comment}
                                    </div>
                                )}

                                {log.imageUrls && log.imageUrls.length > 0 && (
                                    <div className="mt-2 flex gap-2 overflow-x-auto">
                                        {log.imageUrls.map((url, i) => (
                                            <img key={i} src={url} className="w-20 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer" onClick={() => setFullscreenImage(url!)} />
                                        ))}
                                    </div>
                                )}

                                {(log as any).edits?.length > 0 && (
                                    <div className="mt-1 text-[10px] text-slate-400">Edited {(log as any).edits.length} times</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Edit History</h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Current Version */}
                            <div className="border-l-2 border-indigo-500 pl-4">
                                <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Current Version</div>
                                <div className="text-slate-900 whitespace-pre-wrap text-sm">{todo.content || (todo as any).title}</div>
                                <div className="text-xs text-slate-400 mt-2">
                                    {new Date((todo as any).creationTime).toLocaleString()} (Latest)
                                </div>
                            </div>

                            {/* Past Versions */}
                            {(todo as any).contentEdits && [...(todo as any).contentEdits].reverse().map((edit: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-slate-200 pl-4 opacity-75">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Previous Version</div>
                                    <div className="text-slate-800 whitespace-pre-wrap text-sm">{edit.content}</div>
                                    <div className="text-xs text-slate-400 mt-2">
                                        {new Date(edit.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal Overlay */}
            {isFeedbackMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFeedbackMode(false)} />
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {pendingStatus === 'rejected' ? 'Reason for Rejection' :
                                pendingStatus === 'failed' ? 'Reason for Failure' :
                                    'Add Details'}
                        </h3>

                        <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Type your comment here..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4 resize-none"
                        />

                        <div className="mb-6">
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <button
                                    type="button"
                                    onClick={handleCamera}
                                    className="flex-shrink-0 w-16 h-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                {feedbackImage && (
                                    <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={feedbackImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFeedbackImage(null);
                                                setFeedbackImageBlob(null);
                                            }}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsFeedbackMode(false)}
                                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitStatusChange}
                                disabled={isSubmittingFeedback}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmittingFeedback ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Image Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setFullscreenImage(null)}
                >
                    <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
                    <button className="absolute top-4 right-4 text-white p-2">
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            <CreateTodoModal
                isOpen={isSubtaskModalOpen}
                onClose={() => setIsSubtaskModalOpen(false)}
                userEmail={userEmail}
                parentId={effectiveTodoId}
            />
        </div>
    );
}
