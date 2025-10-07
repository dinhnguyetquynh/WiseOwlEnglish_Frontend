import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";

type NavItem = {
  to: string;
  label: string;
  imgSrc: string; // ảnh icon online (VD: link PNG)
};

const navItems: NavItem[] = [
  {
    to: "/learn",
    label: "Học",
    imgSrc :"https://res.cloudinary.com/dxhhluk84/image/upload/v1759120170/home_bohccr.png"
  },
  {
    to: "/learn/progress",
    label: "Tiến độ",
    imgSrc: "https://res.cloudinary.com/dxhhluk84/image/upload/v1759120170/score_d90nby.png",
  },
  // {
  //   to: "/learn/practice",
  //   label: "Luyện tập",
  //   imgSrc: "https://cdn-icons-png.flaticon.com/512/786/786453.png",
  // },
  {
    to: "/learn/rank",
    label: "Bảng xếp hạng",
    imgSrc: "https://res.cloudinary.com/dxhhluk84/image/upload/v1759120169/ranking_ukqicr.png",
  },
  // {
  //   to: "/learn/quests",
  //   label: "Nhiệm vụ",
  //   imgSrc: "https://cdn-icons-png.flaticon.com/512/2541/2541977.png",
  // },
  {
    to: "/learn/shop",
    label: "Cửa hàng",
    imgSrc: "https://res.cloudinary.com/dxhhluk84/image/upload/v1759120170/supermarket_nnlqfu.png",
  },
  {
    to: "/learn/profile",
    label: "Hồ sơ",
    imgSrc: "https://res.cloudinary.com/dxhhluk84/image/upload/v1759120170/kid_qeqlqs.png",
  },
  {
    to: "/learn/more",
    label: "Xem thêm",
    imgSrc: "https://res.cloudinary.com/dxhhluk84/image/upload/v1759130254/info_obokmx.png",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">WiseOwl English</div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              "sidebar__item" + (isActive ? " sidebar__item--active" : "")
            }
          >
            <img src={item.imgSrc} alt={item.label} className="sidebar__icon" />
            <span className="sidebar__label">{item.label.toUpperCase()}</span>
          </NavLink>
        ))}
      </nav> 
    </aside>
  );
}
