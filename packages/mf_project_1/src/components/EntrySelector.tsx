import React, { useState, useMemo } from 'react'

interface EntryInfo {
  url: string
  description?: string
}

interface EntrySelectorProps {
  entries: EntryInfo[]
  selectedUrl: string
  onSelect: (url: string) => void
  onAdd: () => void
  onEdit: (entry: EntryInfo) => void
  onDelete: (url: string) => void
}

const EntrySelector: React.FC<EntrySelectorProps> = ({
  entries,
  selectedUrl,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [filter, setFilter] = useState('')

  // 过滤后的 entries
  const filteredEntries = useMemo(() => {
    if (!filter.trim()) return entries

    const filterLower = filter.toLowerCase()
    return entries.filter(
      (entry) =>
        entry.url.toLowerCase().includes(filterLower) ||
        (entry.description &&
          entry.description.toLowerCase().includes(filterLower))
    )
  }, [entries, filter])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <label style={{ fontWeight: 'bold', color: '#555', fontSize: '16px' }}>
          Entry 列表 ({entries.length})
        </label>
        <button
          onClick={onAdd}
          style={{
            padding: '6px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ➕ 添加 Entry
        </button>
      </div>

      {/* 搜索框 */}
      {entries.length > 0 && (
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="🔍 搜索 Entry (URL 或描述)..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '12px',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Entry 列表 */}
      <div
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          background: '#f8f9fa',
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            {filter ? '没有找到匹配的 Entry' : '暂无 Entry，点击上方按钮添加'}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.url}
              onClick={() => onSelect(entry.url)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                cursor: 'pointer',
                background: selectedUrl === entry.url ? '#e3f2fd' : 'white',
                borderLeft:
                  selectedUrl === entry.url
                    ? '4px solid #2196f3'
                    : '4px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (selectedUrl !== entry.url) {
                  e.currentTarget.style.background = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedUrl !== entry.url) {
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: selectedUrl === entry.url ? 'bold' : 'normal',
                    color: selectedUrl === entry.url ? '#1976d2' : '#333',
                    marginBottom: '4px',
                    fontSize: '14px',
                  }}
                >
                  {entry.description || '未命名 Entry'}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    wordBreak: 'break-all',
                    lineHeight: '1.3',
                  }}
                >
                  {entry.url}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginLeft: '12px',
                  opacity: selectedUrl === entry.url ? 1 : 0.7,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(entry)
                  }}
                  style={{
                    padding: '4px 6px',
                    background: '#ffc107',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(entry.url)
                  }}
                  style={{
                    padding: '4px 6px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 选中状态提示 */}
      {selectedUrl && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#2e7d32',
          }}
        >
          ✅ 已选择:{' '}
          {entries.find((e) => e.url === selectedUrl)?.description ||
            selectedUrl}
        </div>
      )}
    </div>
  )
}

export default EntrySelector
