'use strict';

/* =========================================================
   connection-errors.js – Dịch lỗi Gemini API sang tiếng Việt
   Cập nhật: Bổ sung lỗi mới của v1 API
   ========================================================= */

function geminiConnectionError(status, payload, isModels) {
  const e = payload?.error || {};
  const reason = (e.details || []).map(x => x.reason || '').join(' ');
  const message = String(e.message || '');

  /* Không bao giờ hiển thị text thô từ server vì có thể chứa key */
  if (/API_KEY_INVALID|API_KEY_EXPIRED/.test(reason) ||
      /API key not valid|API key expired|invalid api key/i.test(message))
    return 'Google báo khóa Gemini không hợp lệ hoặc đã hết hiệu lực. Hãy sao chép lại API key trong Google AI Studio (aistudio.google.com/apikey), không dùng khóa OpenAI/ChatGPT.';

  if (/leaked/i.test(message))
    return 'Google đã chặn khóa vì phát hiện khóa bị lộ. Hãy thay khóa trong Google AI Studio và nhập khóa mới tại đây.';

  if (/SERVICE_DISABLED|API_KEY_SERVICE_BLOCKED|API_KEY_HTTP_REFERRER_BLOCKED|API_KEY_IP_ADDRESS_BLOCKED/.test(reason))
    return 'Google chặn quyền sử dụng của khóa này. Kiểm tra "API restrictions" và giới hạn website/IP trong Google Cloud Console của bạn.';

  if (/location.*not supported|not available in your country/i.test(message))
    return 'Google báo Gemini API chưa hỗ trợ vị trí truy cập hiện tại. Thử dùng VPN hoặc kiểm tra cài đặt vùng dự án.';

  if (/quota/i.test(message) || status === 429)
    return 'Đã chạm hạn mức Gemini (429). Hãy chờ vài phút hoặc kiểm tra hạn mức miễn phí / thanh toán tại console.cloud.google.com.';

  if (/model.*not found|not.*support/i.test(message))
    return 'Mô hình không khả dụng với tài khoản này. Hãy kết nối lại và chọn mô hình khác (ví dụ: gemini-2.0-flash).';

  const errors = {
    400: isModels
      ? 'Google từ chối yêu cầu kiểm tra khóa (400). Kiểm tra đây là API key Gemini từ Google AI Studio và đã sao chép đầy đủ. Thử bỏ khoảng trắng đầu/cuối key.'
      : 'Google từ chối yêu cầu soạn bài (400). Hãy thử chọn mô hình khác hoặc giảm độ dài học liệu.',
    401: 'Google không xác thực được khóa (401). Kiểm tra lại API key Gemini – phải bắt đầu bằng AIza…',
    403: 'Khóa không có quyền truy cập Gemini (403). Vào aistudio.google.com/apikey để tạo key mới đúng loại.',
    404: 'Mô hình không còn khả dụng (404). Kết nối lại và chọn mô hình khác.',
    500: 'Google Gemini đang gặp lỗi nội bộ (500). Hãy thử lại sau vài phút.',
    503: 'Gemini đang bận tải (503). Hãy thử lại sau.'
  };
  return errors[status] || `Google trả lỗi ${status}. Hãy thử lại sau.`;
}
