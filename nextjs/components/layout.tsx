import { ReactNode } from 'react';
import Head from 'next/head';
import Nav from './nav';
import styles from '../styles/App.module.css';

interface LayoutType {
    children: ReactNode,
    title?: string,
    description?: string
}

const Layout = ({children, title="Aperture Science Enrichment Center | Subject Management", description="intelliHR technical challenge"}: LayoutType) => {
    return (
      <>
        <Head>
            <meta name="description" content={description} />
            <title>{title}</title>
            <link
                href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap"
                rel="stylesheet"
                />
        </Head>
        <Nav />
        <div className={styles.container}>
            <main className={styles.main}>
                {children}
            </main>
        </div>
      </>
    );
}

export default Layout;