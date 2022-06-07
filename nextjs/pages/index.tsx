
import React, { useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { parseCookies, resolveApiHost } from "../helpers/";
import Layout from "../components/layout";
import axios from 'axios';
import styles from '../styles/App.module.css';

Home.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Home(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol: string}) {
  const [ message, setFormMessage ] = useState('');
  const router = useRouter();
  const api = `${props.protocol}//${props.hostname}`;

  const login = async (event: any) => {
    event.preventDefault()
    try {
      await axios.get(
        `${api}/sanctum/csrf-cookie`,
        { withCredentials: true }
      ).then(async () => {
        await axios({
          method: "post",
          url: `${api}/login`,
          data: {
            "email": event.target.email.value,
            "password": event.target.password.value
          },
          withCredentials: true,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json",
            "Content-Type": "application/json",
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
          }
        }).then(res => {
          router.push('/subjects')})
        .catch(e => {
          if (e.response?.data?.message) {
            setFormMessage(e.response?.data?.message);
          } else {
            setFormMessage('An error occurred, please try again later.')
          }
        })
      });
    } catch (err) {
      setFormMessage('An error occurred, please try again later.')
      console.log(err);
    }
  }

  return (
    <Layout>
      <h1>Please login</h1>
      <section className={styles.content}>
        <form id="login" onSubmit={login} data-testid="login-form">
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" />
          </div>
          {message && (
            <p data-testid="error-msg">{message}</p>
          )}
          <div className={styles.inputGroup}>
            <input id="submit" type="submit"/>
          </div>
        </form>
      </section>
    </Layout>
  )
}
