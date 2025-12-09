"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";

interface ClientType {
  name: string;
}

interface EditClientTypesServedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientTypes: ClientType[]) => void;
  initialClientTypes?: ClientType[];
}

const COMMON_CLIENT_TYPES = [
  "Small Businesses (10-100 employees)",
  "Startups & Early Stage Companies",
  "Non-profit Organizations",
  "Educational Institutions",
  "Individual Professionals",
  "Freelancers & Consultants",
  "Accelerators & Incubators",
  "Corporate Training Departments",
  "HR & L&D Teams",
];

export default function EditClientTypesServedModal({
  isOpen,
  onClose,
  onSave,
  initialClientTypes = [],
}: EditClientTypesServedModalProps) {
  const [clientTypes, setClientTypes] =
    useState<ClientType[]>(initialClientTypes);
  const [newClientTypeName, setNewClientTypeName] = useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setClientTypes(initialClientTypes);
    }
  }, [initialClientTypes, isOpen]);

  const handleAddClientType = () => {
    if (
      newClientTypeName.trim() &&
      !clientTypes.some(
        (ct) => ct.name.toLowerCase() === newClientTypeName.trim().toLowerCase()
      )
    ) {
      setClientTypes([...clientTypes, { name: newClientTypeName.trim() }]);
      setNewClientTypeName("");
    }
  };

  const handleQuickAdd = (clientTypeName: string) => {
    if (!clientTypes.some((ct) => ct.name === clientTypeName)) {
      setClientTypes([...clientTypes, { name: clientTypeName }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddClientType();
    }
  };

  const handleDeleteClientType = (clientTypeName: string) => {
    setClientTypes(clientTypes.filter((ct) => ct.name !== clientTypeName));
  };

  const handleSave = () => {
    onSave(clientTypes);
    onClose();
  };

  const handleCancel = () => {
    setClientTypes(initialClientTypes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Client Types Served
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Client Type Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Client Type
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newClientTypeName}
                onChange={(e) => setNewClientTypeName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter client type"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
              />
              <button
                onClick={handleAddClientType}
                disabled={!newClientTypeName.trim()}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          {/* Your Client Types Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Client Types ({clientTypes.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clientTypes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No client types added yet.
                </p>
              ) : (
                clientTypes.map((clientType) => (
                  <div
                    key={clientType.name}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {clientType.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteClientType(clientType.name)}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Common Client Types Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Add Common Client Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_CLIENT_TYPES.map((clientType) => {
                const isAdded = clientTypes.some(
                  (ct) => ct.name === clientType
                );
                return (
                  <button
                    key={clientType}
                    onClick={() => handleQuickAdd(clientType)}
                    disabled={isAdded}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <Plus className="w-4 h-4 text-gray-600 shrink-0" />
                    <span className="text-sm text-gray-700">{clientType}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Save Client Types
          </button>
        </div>
      </div>
    </div>
  );
}
