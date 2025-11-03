import React, {
  useState,
  useCallback,
  Suspense,
  useEffect,
  useMemo,
} from 'react'
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime'
import EntryForm from './EntryForm'
import EntrySelector from './EntrySelector'
import { useMemoPromise } from 'wy-react-helper'
import { emptyArray } from 'wy-helper'
import { ErrorBoundary } from 'react-error-boundary'
interface EntryInfo {
  url: string
  description?: string
}

const STORAGE_KEY = 'mf_manager_entries'

const ModuleFederationManager: React.FC = () => {
  const [entries, setEntries] = useState<EntryInfo[]>([])
  const [selectedEntryUrl, setSelectedEntryUrl] = useState<string>('')
  const [selectedComponentPath, setSelectedComponentPath] = useState<string>('')
  // 表单状态
  const [showEntryForm, setShowEntryForm] = useState<boolean>(false)
  const [editingEntry, setEditingEntry] = useState<EntryInfo | null>(null)

  // 初始化数据
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setEntries(parsed)
      } catch (error) {
        console.error('Failed to parse saved data:', error)
        initializeDefaultData()
      }
    } else {
      initializeDefaultData()
    }
  }, [])

  // 保存数据到 localStorage
  const saveToStorage = useCallback((data: EntryInfo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [])

  // 初始化默认数据
  const initializeDefaultData = useCallback(() => {
    const defaultEntries: EntryInfo[] = [
      {
        url: 'https://mf2-8nl.pages.dev/mf-manifest.json',
        description: 'MF2 生产环境',
      },
      {
        url: 'https://mf3-6sa.pages.dev/mf-manifest.json',
        description: 'MF3 生产环境',
      },
    ]
    setEntries(defaultEntries)
    saveToStorage(defaultEntries)
  }, [saveToStorage])

  // 更新 entries 并保存
  const updateEntries = useCallback(
    (newEntries: EntryInfo[]) => {
      setEntries(newEntries)
      saveToStorage(newEntries)
    },
    [saveToStorage]
  )

  //   const [components,setComponents]=useState<ComponentDef[]>(emptyArray)
  const { data: componentListData, loading: loadingComponents } =
    useMemoPromise(
      useCallback(async () => {
        // 获取 manifest 信息
        const response = await fetch(selectedEntryUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const manifest = await response.json()
        if (manifest.exposes) {
          setSelectedComponentPath('')
          registerRemotes([
            {
              name: selectedEntryUrl,
              entry: selectedEntryUrl,
            },
          ])
          return manifest.exposes.map((v: any) => v.path) as string[]
        } else {
          throw new Error('not a module federation module')
        }
      }, [selectedEntryUrl])
    )
  const availableComponents =
    componentListData?.type == 'success' ? componentListData.value : emptyArray

  console.log(availableComponents)
  const componentsLoadingError =
    componentListData?.type == 'error' ? componentListData.value : undefined

  // Entry 相关操作
  const handleAddEntry = useCallback(() => {
    setEditingEntry(null)
    setShowEntryForm(true)
  }, [])

  const handleEditEntry = useCallback((entry: EntryInfo) => {
    setEditingEntry(entry)
    setShowEntryForm(true)
  }, [])

  const handleSubmitEntry = useCallback(
    (data: { url: string; description?: string }) => {
      if (editingEntry) {
        // 编辑模式
        const newEntries = entries.map((entry) =>
          entry.url === editingEntry.url
            ? { ...entry, url: data.url, description: data.description }
            : entry
        )
        updateEntries(newEntries)

        // 如果编辑的是当前选中的 entry，更新选中状态
        if (selectedEntryUrl === editingEntry.url) {
          setSelectedEntryUrl(data.url)
        }
      } else {
        // 添加模式
        const newEntry: EntryInfo = {
          url: data.url,
          description: data.description,
        }
        updateEntries([...entries, newEntry])
      }

      setShowEntryForm(false)
      setEditingEntry(null)
    },
    [editingEntry, entries, selectedEntryUrl, updateEntries]
  )

  const handleDeleteEntry = useCallback(
    (entryUrl: string) => {
      if (confirm('确定要删除这个 Entry 吗？')) {
        const newEntries = entries.filter((entry) => entry.url !== entryUrl)
        updateEntries(newEntries)
        if (selectedEntryUrl === entryUrl) {
          setSelectedEntryUrl('')
        }
      }
    },
    [entries, selectedEntryUrl, updateEntries]
  )

  const Comp = useMemo(() => {
    if (selectedEntryUrl && selectedComponentPath) {
      return {
        key: Date.now(),
        Comp: React.lazy(() => {
          let subPath = ''
          if (selectedComponentPath.startsWith('./')) {
            subPath = selectedComponentPath.slice(1)
          }
          return loadRemote(`${selectedEntryUrl}${subPath}`)
        }),
      }
    }
    return {
      key: 0,
      Comp() {
        return null
      },
    }
  }, [selectedEntryUrl, selectedComponentPath])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0' }}>🚀 Module Federation 动态管理器</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          自动获取远程模块的可用组件，选择后自动加载
        </p>
      </div>

      {/* 控制面板 */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
          📋 选择组件 (自动获取可用组件)
        </h3>

        <div
          style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            alignItems: 'start',
          }}
        >
          {/* Entry 选择器 */}
          <EntrySelector
            entries={entries}
            selectedUrl={selectedEntryUrl}
            onSelect={setSelectedEntryUrl}
            onAdd={handleAddEntry}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />

          {/* 组件选择器 */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <label
                style={{
                  fontWeight: 'bold',
                  color: selectedEntryUrl ? '#555' : '#999',
                  fontSize: '16px',
                }}
              >
                可用组件 ({availableComponents.length})
              </label>
              {loadingComponents && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#667eea',
                    fontWeight: 'bold',
                  }}
                >
                  🔄 获取中...
                </div>
              )}
            </div>

            {/* 组件列表 */}
            <div
              style={{
                height: '300px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: selectedEntryUrl ? '#f8f9fa' : '#f5f5f5',
                opacity: selectedEntryUrl ? 1 : 0.6,
              }}
            >
              {!selectedEntryUrl ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  请先选择一个 Entry
                </div>
              ) : loadingComponents ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#667eea',
                  }}
                >
                  🔄 正在获取可用组件...
                </div>
              ) : componentsLoadingError ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#dc3545',
                  }}
                >
                  ❌ 获取组件列表失败:{' '}
                  {componentsLoadingError.message || componentsLoadingError}
                </div>
              ) : availableComponents.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  未找到可用组件
                </div>
              ) : (
                availableComponents.map((componentPath) => (
                  <div
                    key={componentPath}
                    onClick={() => setSelectedComponentPath(componentPath)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      background:
                        selectedComponentPath === componentPath
                          ? '#fff3cd'
                          : 'white',
                      borderLeft:
                        selectedComponentPath === componentPath
                          ? '4px solid #ffc107'
                          : '4px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedComponentPath !== componentPath) {
                        e.currentTarget.style.background = '#f5f5f5'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedComponentPath !== componentPath) {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          selectedComponentPath === componentPath
                            ? 'bold'
                            : 'normal',
                        color:
                          selectedComponentPath === componentPath
                            ? '#856404'
                            : '#333',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {componentPath === '.' ? '(默认导出)' : componentPath}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 选中状态提示 */}
            {selectedComponentPath && selectedEntryUrl && (
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
                {selectedComponentPath === '.'
                  ? '(默认导出)'
                  : selectedComponentPath}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry 表单 */}
      <EntryForm
        isOpen={showEntryForm}
        onClose={() => {
          setShowEntryForm(false)
          setEditingEntry(null)
        }}
        onSubmit={handleSubmitEntry}
        existingUrls={entries.map((e) => e.url)}
        editData={
          editingEntry
            ? { url: editingEntry.url, description: editingEntry.description }
            : undefined
        }
      />

      {/* 已加载组件展示 */}

      <ErrorBoundary
        key={Comp.key}
        fallback={
          <div
            style={{
              background: 'white',
              border: '1px solid #f5c6cb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                组件加载失败
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                组件运行时发生错误，请检查组件代码或网络连接
              </div>
            </div>
          </div>
        }
      >
        <Suspense
          fallback={
            <div
              style={{
                background: 'white',
                border: '1px solid #bee5eb',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  background: '#d1ecf1',
                  color: '#0c5460',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  组件加载中
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  正在从远程模块加载组件，请稍候...
                </div>
              </div>
            </div>
          }
        >
          <Comp.Comp />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default ModuleFederationManager
