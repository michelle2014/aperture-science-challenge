import Link from 'next/link';
import navStyles from '../styles/Nav.module.css';

const Nav = () => {
    return (
        <nav className={navStyles.nav}>
            <ul>
                <li>
                    <Link href="/subjects">Subjects</Link>
                </li>
                <li>
                    <Link href="/create">Create</Link>
                </li>
            </ul>
        </nav>)
};

export default Nav;