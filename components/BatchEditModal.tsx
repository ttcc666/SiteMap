import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import CustomSelect from "./CustomSelect";
import CustomRadio from "./CustomRadio";
import type { Site } from "../types";

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Site>) => void;
  selectedSites: Site[];
  categories: string[];
}

const BatchEditModal: React.FC<BatchEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedSites,
  categories,
}) => {
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [updateMode, setUpdateMode] = useState<"replace" | "append">("replace");

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setCategory("");
      setTags([]);
      setTagInput("");
      setDescription("");
      setUpdateMode("replace");
    }
  }, [isOpen]);

  // 获取所有现有标签用于建议
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    selectedSites.forEach((site) => {
      site.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [selectedSites]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput("");
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    const updates: Partial<Site> = {};

    // 分类更新
    if (category) {
      updates.category = category;
    }

    // 标签更新
    if (tags.length > 0) {
      if (updateMode === "replace") {
        updates.tags = tags;
      } else {
        // append 模式需要在实际应用时合并现有标签
        updates.tags = tags;
      }
    }

    // 描述更新
    if (description.trim()) {
      updates.description = description.trim();
    }

    onSave(updates);
    onClose();
  };

  const hasChanges = category || tags.length > 0 || description.trim();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="批量编辑网站"
      size="large"
    >
      <div className="space-y-6">
        {/* 选中网站信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            将要编辑 {selectedSites.length} 个网站
          </h3>
          <div className="text-sm text-blue-600 dark:text-blue-300">
            {selectedSites
              .slice(0, 3)
              .map((site) => site.name)
              .join(", ")}
            {selectedSites.length > 3 && ` 等 ${selectedSites.length} 个网站`}
          </div>
        </div>

        {/* 分类编辑 */}
        <div>
          <label
            htmlFor="batch-category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            分类
          </label>
          <CustomSelect
            value={category}
            onChange={(value) => setCategory(value as string)}
            placeholder="不修改分类"
            options={[
              { value: "", label: "不修改分类" },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
          />
        </div>

        {/* 标签编辑 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="batch-tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              标签
            </label>
            <CustomRadio
              name="updateMode"
              value={updateMode}
              onChange={(value) => setUpdateMode(value as "replace" | "append")}
              options={[
                {
                  value: "replace",
                  label: "替换",
                  description: "完全替换现有标签",
                },
                {
                  value: "append",
                  label: "追加",
                  description: "添加到现有标签",
                },
              ]}
              layout="horizontal"
              className="text-xs"
            />
          </div>

          {/* 标签输入 */}
          <div className="space-y-2">
            <input
              id="batch-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="输入标签，按回车或逗号添加"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            {/* 已添加的标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200"
                      aria-label={`删除标签 ${tag}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 标签建议 */}
            {allTags.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  常用标签:
                </div>
                <div className="flex flex-wrap gap-1">
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      disabled={tags.includes(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        tags.includes(tag)
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 描述编辑 */}
        <div>
          <label
            htmlFor="batch-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            描述 (将替换所有选中网站的描述)
          </label>
          <textarea
            id="batch-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入新的描述..."
            rows={3}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            保存更改
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default BatchEditModal;
