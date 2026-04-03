// src/pages/Thongbao.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';

function ThongbaoPage() {
  return (
  <div className="thongbao-page">
    <h2>  Module Thông báo đang được tích hợp các chức năng sau:</h2>


    <ul>
      <li>
        <strong>1. Đối với cơ sở gỗ, cơ sở gây nuôi:</strong>
        <ul>
          <li>
            - Nhận sự hướng dẫn việc xuất bảng kê lâm sản, biến động khối lượng,
            số lượng lâm sản trước khi thực hiện;
          </li>
          <li>
            - Nhận thông báo, kế hoạch kiểm tra, văn bản quy phạm pháp luật,
            tài liệu từ cơ quan Kiểm lâm sở tại.
          </li>
        </ul>
      </li>

      <li>
        <strong>2. Đối với cơ quan Kiểm lâm:</strong>
        <ul>
          <li>
            - Xử lý bảng kê và biến động số lượng, khối lượng lâm sản qua phần mềm;
          </li>
          <li>
            - Thực hiện các quyền quản trị đối với các cơ sở được phân quyền quản lý;
          </li>
          <li>
            - Thực hiện các chức năng quản lý của cơ quan Kiểm lâm sở tại.
          </li>
        </ul>
      </li>
    </ul>
  </div>
);
}

export default ThongbaoPage;