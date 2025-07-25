// src/pages/ManagementPage.js
import React, { useEffect } from 'react';

/**
 * Component ManagementPage để hiển thị trang quản lý lâm sản.
 * Cập nhật tiêu đề tab của trình duyệt khi trang được tải.
 */
function ManagementPage() {
  // useEffect hook để thực hiện các side effects sau khi render
  useEffect(() => {
    // Cập nhật tiêu đề tab của trình duyệt
    document.title = 'Quản lý lâm sản - Ứng dụng của tôi'; 
    // Ghi log ra console để xác nhận tiêu đề đã được cập nhật
    console.log('Tiêu đề trang đã được cập nhật thành:', document.title);
  }, []); // Mảng phụ thuộc rỗng đảm bảo hiệu ứng chỉ chạy một lần sau khi component mount

  return (
    <div className="management-page-content">
      {/* Tiêu đề chính của trang */}
      <h1>Quản lý lâm sản</h1>
      {/* Đoạn văn bản mô tả */}
      <p>Đây là trang quản lý toàn diện các hoạt động liên quan đến lâm sản, bao gồm khai thác, vận chuyển và bảo tồn.</p>
      
      {/* Bạn có thể thêm các thành phần UI khác tại đây, ví dụ: */}
      {/* <section className="data-overview">
        <h2>Tổng quan dữ liệu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">Tổng số cây: 10,000</div>
          <div className="card">Diện tích rừng: 500 ha</div>
          <div className="card">Sản lượng khai thác: 200 m³</div>
        </div>
      </section>

      <section className="recent-activities mt-8">
        <h2>Hoạt động gần đây</h2>
        <ul>
          <li>Kiểm tra rừng định kỳ tại khu vực A - 15/07/2025</li>
          <li>Vận chuyển gỗ từ khu vực B đến nhà máy X - 14/07/2025</li>
          <li>Trồng mới cây con tại khu vực C - 10/07/2025</li>
        </ul>
      </section> */}
    </div>
  );
}

export default ManagementPage;
