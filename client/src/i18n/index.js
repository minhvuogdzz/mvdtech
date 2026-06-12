import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      nav: {
        home: 'Trang chủ',
        about: 'Giới thiệu',
        skills: 'Kỹ năng',
        portfolio: 'Dự án',
        services: 'Dịch vụ',
        blog: 'Blog',
        contact: 'Liên hệ',
      },
      hero: {
        greeting: 'Xin chào, tôi là',
        cta_portfolio: 'Xem dự án',
        cta_contact: 'Liên hệ ngay',
      },
      common: {
        view_all: 'Xem tất cả',
        view_more: 'Xem thêm',
        back: 'Quay lại',
        search: 'Tìm kiếm...',
        loading: 'Đang tải...',
        no_data: 'Chưa có dữ liệu',
        send: 'Gửi',
        copy_email: 'Đã sao chép email!',
        filter_all: 'Tất cả',
        read_more: 'Đọc thêm',
        minutes_read: 'phút đọc',
        projects_completed: 'Dự án',
        years_experience: 'Năm kinh nghiệm',
        technologies: 'Công nghệ',
        clients: 'Khách hàng',
      },
      contact: {
        title: 'Liên hệ',
        name: 'Họ và tên',
        email: 'Email',
        phone: 'Số điện thoại',
        message: 'Tin nhắn',
        send: 'Gửi tin nhắn',
        success: 'Gửi thành công! Tôi sẽ phản hồi sớm nhất.',
      },
      chat: {
        greeting: 'Chào bạn! Mình là AI Assistant của MVD Tech. Mình có thể giúp gì cho bạn?',
        placeholder: 'Nhập tin nhắn...',
        tour_title: 'Xin chào! 👋',
        tour_message: 'Mình là AI Assistant. Bạn muốn xem dự án, tìm hiểu dịch vụ hay trò chuyện với mình?',
        tour_portfolio: 'Xem dự án',
        tour_services: 'Dịch vụ',
        tour_chat: 'Trò chuyện',
      },
      command: {
        placeholder: 'Tìm kiếm trang, dự án, bài viết...',
        pages: 'Trang',
        projects: 'Dự án',
        posts: 'Bài viết',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        skills: 'Skills',
        portfolio: 'Portfolio',
        services: 'Services',
        blog: 'Blog',
        contact: 'Contact',
      },
      hero: {
        greeting: "Hi, I'm",
        cta_portfolio: 'View Projects',
        cta_contact: 'Contact Me',
      },
      common: {
        view_all: 'View All',
        view_more: 'View More',
        back: 'Go Back',
        search: 'Search...',
        loading: 'Loading...',
        no_data: 'No data yet',
        send: 'Send',
        copy_email: 'Email copied!',
        filter_all: 'All',
        read_more: 'Read More',
        minutes_read: 'min read',
        projects_completed: 'Projects',
        years_experience: 'Years Experience',
        technologies: 'Technologies',
        clients: 'Clients',
      },
      contact: {
        title: 'Contact',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone',
        message: 'Message',
        send: 'Send Message',
        success: 'Sent successfully! I will respond as soon as possible.',
      },
      chat: {
        greeting: "Hello! I'm MVD Tech's AI Assistant. How can I help you?",
        placeholder: 'Type a message...',
        tour_title: 'Hello! 👋',
        tour_message: "I'm the AI Assistant. Would you like to view projects, explore services, or chat with me?",
        tour_portfolio: 'Projects',
        tour_services: 'Services',
        tour_chat: 'Chat',
      },
      command: {
        placeholder: 'Search pages, projects, posts...',
        pages: 'Pages',
        projects: 'Projects',
        posts: 'Posts',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('mvd-lang') || 'vi',
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

export default i18n;
