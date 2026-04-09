import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, UploadCloud, Trash2, Edit2, 
  Download, X, File, Image as ImageIcon,
  CheckCircle2, AlertCircle, Loader2, Plus, MousePointer2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import styles from './DocumentManager.module.css';

interface Document {
  id: string;
  name: string;
  file_url: string;
  document_type: string;
  created_at: string;
}

interface DocumentManagerProps {
  entityType: 'student' | 'parent' | 'lead' | 'tutor';
  entityId: string;
}

export function DocumentManager({ entityType, entityId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isDragModalOpen, setIsDragModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('related_type', entityType)
      .eq('related_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch documents:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIsDragModalOpen(false);
      await handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setIsDragModalOpen(false);
      await handleUpload(e.target.files);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setErrorText(null);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${entityType}/${entityId}/${Date.now()}_${safeName}`;
        
        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, { upsert: true });
          
        if (storageError) throw storageError;

        // 2. Insert into DB
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            related_type: entityType,
            related_id: entityId,
            name: file.name,
            file_url: filePath,
            document_type: file.type || fileExt || 'unknown',
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
      await fetchDocuments();
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorText(err.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  const startRename = (doc: Document) => {
    setEditingId(doc.id);
    setEditingName(doc.name);
  };

  const saveRename = async () => {
    if (!editingId || !editingName.trim()) return;
    
    const { error } = await supabase
      .from('documents')
      .update({ name: editingName.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId);
      
    if (error) {
      console.error('Rename error:', error);
      setErrorText('Failed to rename document.');
    } else {
      setDocuments(docs => docs.map(d => d.id === editingId ? { ...d, name: editingName.trim() } : d));
    }
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    const doc = documents.find(d => d.id === deletingId);
    if (!doc) return;

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', deletingId);
        
      if (dbError) throw dbError;

      // 2. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_url]);
        
      if (storageError) console.error('Storage deletion error:', storageError);

      setDocuments(docs => docs.filter(d => d.id !== deletingId));
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorText('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 60); // 60 seconds expiry
        
      if (error) throw error;
      
      if (data && data.signedUrl) {
        // Create an invisible link to trigger download
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download error:', err);
      setErrorText('Failed to download document.');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={20} className={styles.iconImage} />;
    if (mimeType.includes('pdf')) return <FileText size={20} className={styles.iconPdf} />;
    return <File size={20} className={styles.iconGeneric} />;
  };


  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={24} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        multiple 
        onChange={handleFileChange}
        className={styles.fileInput}
        style={{ display: 'none' }}
      />

      {errorText && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          {errorText}
          <button className={styles.errorClose} onClick={() => setErrorText(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Document List */}
      <div className={styles.documentList}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Uploaded Documents
            <span className={styles.listCount}>{documents.length}</span>
          </h3>
          <div className={styles.headerActions}>
            <Button variant="secondary" size="sm" onClick={() => setIsDragModalOpen(!isDragModalOpen)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MousePointer2 size={14} />
                <span>Drag Add</span>
              </div>
            </Button>
            <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {uploading ? <Loader2 className={styles.spinner} size={14} /> : <Plus size={14} />}
                <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
              </div>
            </Button>
          </div>
        </div>



        {documents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FileText size={24} /></div>
            <p className={styles.emptyText}>No documents added yet</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.docCard}>
                <div className={styles.docIconArea}>
                  {getFileIcon(doc.document_type)}
                </div>
                <div className={styles.docInfo}>
                  {editingId === doc.id ? (
                    <div className={styles.renameForm}>
                      <input 
                        type="text" 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)}
                        className={styles.renameInput}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button onClick={saveRename} className={styles.renameSaveBtn} title="Save">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className={styles.renameCancelBtn} title="Cancel">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <h4 className={styles.docName} title={doc.name}>{doc.name}</h4>
                  )}
                  <span className={styles.docMeta}>
                    {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    {/* Size calculation is not stored in DB currently, we skip it or could add it later */}
                  </span>
                </div>
                
                <div className={styles.docActions}>
                  <button className={styles.actionBtn} onClick={() => handleDownload(doc)} title="Download">
                    <Download size={16} />
                  </button>
                  <button className={styles.actionBtn} onClick={() => startRename(doc)} title="Rename">
                    <Edit2 size={15} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => setDeletingId(doc.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && createPortal(
        <div className={styles.modalOverlay} onClick={() => setDeletingId(null)}>
          <div className={styles.deleteDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.deleteTitle}>Delete Document</h3>
            <p className={styles.deleteText}>
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div className={styles.deleteActions}>
              <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Drag & Drop Modal */}
      {isDragModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={() => setIsDragModalOpen(false)}>
          <div className={styles.dragDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dragDialogHeader}>
               <h3 className={styles.dragDialogTitle}>Drag & Drop Files</h3>
               <button className={styles.dragDialogClose} onClick={() => setIsDragModalOpen(false)}>
                 <X size={18} />
               </button>
            </div>
            
            <div 
              className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneContent}>
                <div className={styles.uploadIconWrapper}>
                  {uploading ? (
                    <Loader2 className={styles.spinner} size={28} />
                  ) : (
                    <UploadCloud size={28} />
                  )}
                </div>
                <h3 className={styles.dropzoneTitle}>
                  {uploading ? 'Uploading...' : 'Click or drop files here'}
                </h3>
                <p className={styles.dropzoneText}>
                  Supports PDF, JPG, PNG, DOCX, and more
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
