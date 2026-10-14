# 我的音樂庫

原生 HTML、CSS、JavaScript 的個人播放器。音訊不經過播放器伺服器；本機匯入檔案、離線下載及自訂歌名／封面保存在目前裝置與網站來源的 IndexedDB。

## 在電腦維護線上歌單

- `songs.json` 是歌單檔，目前保持空白 `{"songs": []}`，沒有附帶示範歌曲或私人音訊。
- 將準備公開分享的音訊放進 `audio/`，封面放進 `covers/`。這些檔案不會由播放器自動上傳。
- 每個 `id` 必須固定且唯一。修改歌名只改 `title`；替換音訊內容時請更新 `version`，例如從 `1` 改為 `2`。
- 所有路徑都相對於 `songs.json` 所在的專案目錄，適用 GitHub Pages 的子資料夾網址。
- GitHub Pages 是公開網站：音訊與封面可被取得網址的人存取。不要放私人或未取得權利的內容。

把以下範例中的路徑、ID、標題與版本換成實際存在的檔案後，再加入 `songs.json`。這些是格式範例，**不是本專案內的歌曲**：

```json
{
  "songs": [
    {
      "id": "your-stable-song-id",
      "title": "你的歌曲名稱",
      "audioUrl": "audio/your-audio-file.mp3",
      "coverUrl": "covers/your-cover-image.jpg",
      "version": "1"
    }
  ]
}
```

`coverUrl` 可省略。音訊支援瀏覽器可播放的格式（建議 MP3 或 M4A）；封面支援 JPEG、PNG、WebP。JSON 必須使用雙引號、不可有尾端逗號。ID 重複、欄位無效或路徑離開專案目錄時，更新會被拒絕，播放器會保留上次成功保存的歌單。

## 在本機測試

在 VS Code 安裝並使用 Live Server，從專案根目錄開啟 `index.html`。不要用 `file://` 直接開啟，因為 IndexedDB、Service Worker 與相對網址需要網站來源。

## 部署到 GitHub Pages

1. 在 GitHub 建立自己的 repository，將這個專案檔案放在 repository 根目錄；不要加入不打算公開的音訊或封面。
2. 在電腦編輯 `songs.json`，並先將其中每個實際音訊／封面檔案放入 `audio/`、`covers/`。
3. 將要公開的網站檔案提交到你自己的 repository。播放器程式不含任何 GitHub 帳號或 repository 名稱。
4. 在 repository 的 **Settings → Pages** 選擇來源分支與目錄（例如 `main` 與 `/(root)`），儲存後使用 GitHub 顯示的 Pages 網址。
5. 以該網址開啟一次，等 Service Worker 安裝完成。日後更新歌曲清單時提交 `songs.json` 與必要音訊／封面；播放器透過相對路徑在子資料夾部署下解析資源。

Service Worker 只快取播放器介面、圖示與最新可取得的 `songs.json`，不會預先下載歌曲。新版等待使用者在資訊面板按「套用播放器更新」才啟用，不會強制重新載入正在播放的頁面。線上歌單音訊要離線播放，需在播放器中下載到 IndexedDB。

## 儲存與備份

本機歌曲、離線音訊、自訂歌名與自訂封面都綁定此裝置及網站來源，不會跨裝置同步。清除網站資料可能移除這些資料。下一階段可加入 IndexedDB 備份匯出／匯入功能。
