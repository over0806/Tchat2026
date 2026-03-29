import random
from typing import List, Tuple
from .models import Job, ChatMessage

class MockChatService:
    @staticmethod
    def get_response(messages: List[ChatMessage], tab: str, all_jobs: List[Job]) -> Tuple[str, List[Job]]:
        last_message = messages[-1].text.lower() if messages else ""
        
        if tab == 'intro':
            # Intro tab responses
            if "鸚鵡螺" in last_message or "nautilus" in last_message:
                response = "鸚鵡螺號象徵著對未知世界的探索與導航。在台泥，我們也致力於在全球化的永續發展中，帶領同仁一同航向綠色與數位的深海。🚢"
            elif "設計" in last_message or "理念" in last_message:
                response = "展場設計融合了 150 年前的復古機械與全息技術，寓意台泥深厚的產業根基與對未來科技的追求。您可以查看地圖來了解更多分區！"
            elif "地圖" in last_message:
                response = "地圖已為您標註了各個展區位置。您可以直接點擊上方的小標籤或輸入『鸚鵡螺號』來深入了解我們的主要展品。🗺️"
            else:
                response = "您好！我是導覽員。這是一個關於夢想與實踐的展區。您可以詢問關於『鸚鵡螺號』的設計理念，或了解台泥如何實踐永續。有什麼我能幫您的嗎？"
            return response, []

        else:
            # Match tab responses
            filtered_jobs = []
            if "ma" in last_message or "儲備幹部" in last_message:
                response = "我們目前的 MA 計畫包含數位轉型與永續金融組。這些職缺提供跨國輪調與核心專案參與的機會。您可以參考下方的 MA 相關職缺。💼"
                filtered_jobs = [j for j in all_jobs if "MA" in j.category or "MA" in j.title]
            elif "環工" in last_message:
                response = "台泥非常重視環境管理與減碳排放。目前有環境管理工程師的職缺，歡迎擁有相關背景的您加入！🌿"
                filtered_jobs = [j for j in all_jobs if "Environmental" in j.category or "環工" in j.title]
            elif "資訊" in last_message or "數位" in last_message or "轉型" in last_message:
                response = "數位轉型是台泥集團的核心策略之一。我們正在尋找具備數據分析與流程優化能力的專案員。以下是為您推薦的職缺。💻"
                filtered_jobs = [j for j in all_jobs if any(x in j.title or x in "".join(j.description) for x in ["資訊", "數位", "轉型"])]
            elif "熱門" in last_message:
                response = "目前最受關注的是我們的 MA 儲備幹部與數位轉型專案職缺。您可以點擊下方卡片查看詳細需求與福利待遇！"
                filtered_jobs = all_jobs[:4]
            else:
                response = "您好！我是招募顧問。不知道您對什麼類型的職位感興趣？您可以輸入關鍵字，例如『MA』、『環工』或『數位』來尋找最適合您的機會。"
                filtered_jobs = all_jobs[:4]
            
            return response, filtered_jobs
