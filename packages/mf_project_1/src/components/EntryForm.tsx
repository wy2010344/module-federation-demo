import React, { useState } from 'react'

interface EntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { url: string; description?: string }) => void
  existingUrls: string[]
  editData?: { url: string; description?: string }
}

const EntryForm: React.FC<EntryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingUrls,
  editData,
}) => {
  const [formData, setFormData] = useState({
    url: editData?.url || '',
    description: editData?.description || '',
  })

  const handleSubmit = () => {
    const trimmedUrl = formData.url.trim()

    // 编辑模式时，URL 不能修改，直接使用原 URL
    const finalUrl = editData ? editData.url : trimmedUrl

    if (!finalUrl) {
      alert('请输入 URL')
      return
    }

    // 检查 URL 是否重复（编辑时排除自己）
    if (!editData && existingUrls.includes(finalUrl)) {
      alert('该 URL 已存在')
      return
    }

    onSubmit({
      url: finalUrl,
      description: formData.description.trim() || undefined,
    })

    setFormData({ url: '', description: '' })
  }

  const handleClose = () => {
    setFormData({ url: '', description: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          {editData ? '编辑 Entry' : '添加新的 Entry'}
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            URL *
          </label>
          {editData ? (
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#f5f5f5',
                color: '#666',
                boxSizing: 'border-box',
              }}
            >
              {editData.url}
              <div
                style={{ fontSize: '12px', marginTop: '4px', color: '#999' }}
              >
                编辑时不可修改 URL
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com/mf-manifest.json"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            描述 (可选)
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="例如: MF2 生产环境"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: editData ? '#ffc107' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {editData ? '更新' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntryForm
