import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, CheckCircle2, XCircle, ShieldCheck, AlertCircle, Plus, History, Image as ImageIcon, Loader2 } from 'lucide-react';
import { StatusBadge, TodoStatus } from './StatusBadge';
import { TodoList } from './TodoList';
import { CreateTodoModal } from './CreateTodoModal';
import { UserAvatar } from './UserAvatar';
import { Camera, CameraResultType } from '@capacitor/camera';

interface TodoDetailModalProps {
    todoId: string;
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

export function TodoDetailModal({ todoId, isOpen, onClose, userEmail }: TodoDetailModalProps) {
    const todo = useQuery(api.todos.getById, { id: todoId as Id<"todos"> });
    const subtasks = useQuery(api.todos.getSubtasks, { parentId: todoId as Id<"todos"> });
    const logs = useQuery(api.todos.getLogs, { todoId: todoId as Id<"todos"> });
    const updateStatus = useMutation(api.todos.updateStatus);
    const generateUploadUrl = useMutation(api.todos.generateUploadUrl);

    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    // Feedback state
    const [isFeedbackMode, setIsFeedbackMode] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TodoStatus | null>(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackImage, setFeedbackImage] = useState<string | null>(null);
    const [feedbackImageBlob, setFeedbackImageBlob] = useState<Blob | null>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    if (!isOpen || !todo) return null;

    const isAssignee = todo.assigneeEmail === userEmail;
    const isCreator = todo.creator?.email === userEmail;

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

        // Always open feedback modal for significant actions or if adding remark
        // Significant: failed, rejected, approved (optional remark), completed (optional remark)
        // Requirement: "打回可能需要补充图文描述", "反馈也需要图文描述"
        // So we basically always allow adding text/image when changing status.

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
                todoId: todoId as Id<"todos">,
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

    return (
        <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white w-full max-w-2xl h-full shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={todo.status as TodoStatus} />
                            <span className="text-xs text-slate-400">
                                {new Date((todo as any).creationTime || (todo as any)._creationTime).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight whitespace-pre-wrap">
                            {todo.content || (todo as any).title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8 flex-1 z-0">

                    {/* Images */}
                    {todo.imageUrls && todo.imageUrls.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Attachments</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {todo.imageUrls.map((url, idx) => (
                                    url && (
                                        <div
                                            key={idx}
                                            className="rounded-xl overflow-hidden border border-slate-100 aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setFullscreenImage(url)}
                                        >
                                            <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* People */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                            <UserAvatar email={todo.assigneeEmail} name={todo.assignee?.name} />
                            <div className="overflow-hidden">
                                <span className="text-xs text-slate-500 font-medium block">Assigned To</span>
                                <div className="font-medium text-slate-900 truncate text-sm">{todo.assignee?.name || todo.assigneeEmail.split('@')[0]}</div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                            <UserAvatar email={todo.creator?.email || ""} name={todo.creator?.name} />
                            <div className="overflow-hidden">
                                <span className="text-xs text-slate-500 font-medium block">Created By</span>
                                <div className="font-medium text-slate-900 truncate text-sm">{todo.creator?.name || todo.creator?.email?.split('@')[0] || "Unknown"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {isAssignee && (
                                <>
                                    <button
                                        onClick={() => initiateStatusChange('completed')}
                                        className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        {todo.status === 'completed' ? 'Add Remark' : 'Mark Complete'}
                                    </button>
                                    <button
                                        onClick={() => initiateStatusChange('failed')}
                                        className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        {todo.status === 'failed' ? 'Add Remark' : 'Mark Failed'}
                                    </button>
                                </>
                            )}

                            {isCreator && (todo.status === 'completed' || todo.status === 'failed' || todo.status === 'approved' || todo.status === 'rejected') && (
                                <>
                                    <button
                                        onClick={() => initiateStatusChange('approved')}
                                        className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        {todo.status === 'approved' ? 'Add Remark' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => initiateStatusChange('rejected')}
                                        className="flex items-center justify-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-xl font-medium hover:bg-orange-100 transition-colors"
                                    >
                                        <AlertCircle className="w-5 h-5" />
                                        {todo.status === 'rejected' ? 'Add Remark' : 'Reject'}
                                    </button>
                                </>
                            )}
                        </div>
                        {!isAssignee && !isCreator && (
                            <p className="text-sm text-slate-400 italic">You are a viewer of this task.</p>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Subtasks</h3>
                            <button
                                onClick={() => setIsSubtaskModalOpen(true)}
                                className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
                            >
                                <Plus className="w-4 h-4" /> Add Subtask
                            </button>
                        </div>
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                            <TodoList
                                todos={subtasks}
                                isLoading={subtasks === undefined}
                                onTodoClick={() => { }}
                                emptyMessage="No subtasks yet."
                            />
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> History
                        </h3>
                        <div className="space-y-4 pl-2 border-l-2 border-slate-100">
                            {logs?.map((log) => (
                                <div key={log._id} className="relative pl-6 pb-2">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                                    <div className="text-sm">
                                        <span className="font-medium text-slate-900">{log.user?.name || log.user?.email.split('@')[0]}</span>
                                        <span className="text-slate-500 mx-1">
                                            {log.action === 'create' ? 'created task' :
                                                log.action === 'mark_completed' ? 'marked completed' :
                                                    log.action === 'mark_failed' ? 'marked failed' :
                                                        log.action === 'approve' ? 'approved' :
                                                            log.action === 'reject' ? 'rejected' :
                                                                log.action === 'update' ? 'updated' : log.action}
                                        </span>
                                    </div>
                                    {log.comment && (
                                        <div className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                                            "{log.comment}"
                                        </div>
                                    )}
                                    {log.imageUrls && log.imageUrls.length > 0 && (
                                        <div className="mt-2 flex gap-2 overflow-x-auto">
                                            {log.imageUrls.map((url, i) => (
                                                <img key={i} src={url ?? undefined} className="w-16 h-16 object-cover rounded-lg border border-slate-200" onClick={() => setFullscreenImage(url!)} />
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal Overlay */}
            {isFeedbackMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFeedbackMode(false)} />
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {pendingStatus === 'rejected' ? 'Reason for Rejection' :
                                pendingStatus === 'failed' ? 'Reason for Failure' :
                                    'Add Details (Optional)'}
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

                        <button
                            onClick={submitStatusChange}
                            disabled={isSubmittingFeedback}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmittingFeedback ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                        </button>
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
                parentId={todoId as Id<"todos">}
            />
        </div>
    );
}
