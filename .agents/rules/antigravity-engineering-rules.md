---
trigger: always_on
---

# Antigravity 通用工程規則 (Rules)

## 一、 語言與輸出約定

* **語系規範**：所有回覆、說明、註解、文件 **必須使用繁體中文**。
* **程式碼命名**：識別碼（Identifiers）保持英文，嚴禁使用拼音。
* **系統資訊**：錯誤訊息（Error Messages）、日誌內容（Logs）允許使用英文。

---

## 二、 技術架構預設

* **前端 (Frontend)**：預設使用 **React + TypeScript**。
* **後端 (Backend)**：預設使用 **Python**（優先選用 **FastAPI**）。
* **環境標準**：若無特殊說明，均遵循上述技術棧進行開發。

---

## 三、 通用程式碼規範

### 1. 命名規範
* **變數 / 函數**：`camelCase` (小駝峰)
* **類別 / 元件**：`PascalCase` (大駝峰)
* **常數**：`UPPER_SNAKE_CASE` (全大寫底線)
* **檔案 / 資料夾**：`kebab-case` (短橫線連接)
* **原則**：命名應語意清晰、具備自我解釋能力，禁止隨意縮寫。

### 2. 註解規範（強制執行）
* **核心理念**：註解應解釋「**為什麼這樣設計** (Why)」，而非單純複述程式碼邏輯 (What)。
* **必寫場景**：複雜邏輯、業務判斷、邊界條件 (Edge Cases) 必須撰寫註解。
* **統一標記**：
    * `// TODO:` 待實現的功能。
    * `// FIXME:` 已知問題或潛在缺陷。
    * `// NOTE:` 重要設計說明或背景知識。
    * `// HACK:` 臨時方案，標記後續必須重構。

#### 函數註解範例
* **前端 (JSDoc)**:
    ```typescript
    /**
     * 取得使用者資訊
     * @param userId 使用者 ID
     * @returns 使用者資料物件
     */
    ```
* **後端 (Python Docstring)**:
    ```python
    def get_user(user_id: str):
        """
        根據使用者 ID 獲取詳細資訊
        """
    ```

---

## 四、 前端開發規範 (React)

### 1. 基本原則
* 全面使用 **Function Components**，不使用 Class Components。
* **單一職責**：每個元件只處理一件事情。
* **邏輯分離**：UI 展示邏輯與業務邏輯（API 調用等）分離。
* **重複利用**：可複用的邏輯必須封裝為 **Custom Hooks**。

### 2. 命名與結構
* 元件名稱使用 `PascalCase`，且檔案名稱須與元件名稱一致。
* Custom Hooks 必須以 `use` 開頭。
    ```tsx
    function UserCard() {} // 元件
    function useUserData() {} // Hook
    ```

### 3. Props 與 Hooks 規範
* Props 必須使用 **TypeScript Interface/Type** 定義。
* 使用 **解構賦值** 接收 Props；非必填參數使用 `?`。
    ```tsx
    interface UserCardProps {
      user: User;
      onClick?: () => void;
    }
    ```
* Hooks 不得在條件判斷、迴圈或巢狀函數中調用。

### 4. 效能優化
* 避免不必要的重複渲染 (Re-render)。
* 合理使用 `useMemo` 與 `useCallback`。
* 列表渲染 (List Rendering) 必須提供穩定且唯一的 `key`。
* 針對大量數據列表使用 **虛擬滾動 (Virtual Scrolling)**。

---

## 五、 後端開發規範 (Python)

### 1. 基本要求
* Python 版本 $\ge 3.10$。
* 所有函數與方法必須標註 **Type Hints**。
* 禁止使用裸露的 `except:`（必須指定異常類型）。
* 禁止在正式環境使用 `print()`，統一使用 `logging` 模組。

### 2. 分層架構（嚴格遵守）
為了確保系統解耦，禁止在 `api` 層直接操作資料庫：
1.  **api**：請求解析、路由定義與回應封裝。
2.  **service**：核心業務邏輯處理（跨 Model 運算等）。
3.  **repository**：資料庫存取層 (DAO)。
4.  **schema**：Pydantic 資料校驗與序列化。
5.  **model**：ORM 模型定義 (SQLAlchemy/SQLModel)。

---

## 六、 安全規範 (Security)

### 1. 通用安全原則
* **零信任**：永遠不信任來自客戶端的輸入。
* **校驗**：所有輸入參數必須進行嚴格校驗（格式、長度、類型）。
* **權限**：敏感操作必須經過身分驗證 (Authentication) 與權限檢查 (Authorization)。

### 2. 前後端安全實作
* **前端**：
    * 禁止使用 `dangerouslySetInnerHTML`。
    * 防止 XSS / CSRF 攻擊。
    * 敏感資訊（如密碼）不存儲於前端儲存體，Token 推薦使用 `HttpOnly Cookie`。
* **後端**：
    * 使用 Pydantic 進行強型別校驗。
    * 所有密鑰 (Secret Keys) 必須從環境變數 (`.env`) 讀取。
    ```python
    import os
    SECRET_KEY = os.getenv("SECRET_KEY")
    ```
    * 回傳資料給前端前，必須進行 **脫敏處理**（隱藏密碼、機敏個資等）。

---

## 七、 AI 協作與生成規範

* 所有 AI 自動產生的程式碼必須百分之百符合本規則。
* **生成品質要求**：
    * **結構清晰**：模組化且易於閱讀。
    * **類型完整**：嚴格的 TypeScript/Python Type Hints。
    * **安全優先**：主動考慮邊界處理與防禦性編程。
    * **拒絕過度設計**：不產生不必要的複雜實作，保持 K.I.S.S. (Keep It Simple, Stupid) 原則。