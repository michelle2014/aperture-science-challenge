import React, { useEffect, useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { parseCookies, resolveApiHost } from "../helpers/";
import Layout from "../components/layout";
import axios from 'axios';
import styles from '../styles/App.module.css';

Create.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Create(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol: string}) {
  const router = useRouter();
  const [ message, setFormMessage ] = useState('');
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const api = `${props.protocol}//${props.hostname}`;

  const create = async (event: any) => {

    event.preventDefault();
    try {
        await axios.post(`${api}/graphql`, {
          query: `
          mutation ($id: ID!, $name: String!, $test_chamber: Int!, $date_of_birth: DateTime!, $score: Int!, $alive: Boolean!, $created_at: DateTime!) {
            createSubject (id: $id, name: $name, score: $score, test_chamber: $test_chamber, alive: $alive, date_of_birth: $date_of_birth, created_at: $created_at) {
              id
              name
              score
              test_chamber
              alive
              date_of_birth
              created_at
            }
          }`,
          variables:
            {
              id:event.target.id.value,
              name:event.target.name.value,
              test_chamber:parseInt(event.target.test_chamber.value, 10),
              date_of_birth:event.target.date_of_birth.value,
              score:parseInt(event.target.score.value, 10),
              alive:(event.target.alive.value === "Y")? true: false,
              created_at: new Date().toISOString().substring(0,19).replace('T', ' ')},
          withCredentials: true,
        }).then(res => {
            console.log(res);
            router.push('/subjects')})
        .catch(e => {
          if (e.response?.data?.message) {
            setFormMessage(e.response?.data?.message);
          } else {
            setFormMessage('An error occurred, please try again later.')
          }
      });
    } catch (err) {
      setFormMessage('An error occurred, please try again later.')
      console.log(err);
    }
  };

  return (
    <Layout>
      { authenticated && <>
      <h1>Create new subject</h1>
      <section className={styles.content}>
          <form id="create-subject" onSubmit={create} data-testid="create-subject-form">
            <div className={styles.inputGroup}>
              <label htmlFor="id">ID</label>
              <input id="id" type="number" name="id" required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" name="name" required/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="date-of-birth">DOB</label>
              <input id="date-of-birth" type="date" name="date-of-birth" required/>
              <p>(example: 2022-06-03 02:13:21)</p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="score">Score</label>
              <input id="score" type="number" name="score" required/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="alive">Alive</label>
              <input id="alive" type="text" name="alive" required/>
              <p>(please enter Y or N)</p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="test-chamber">Chamber</label>
              <input id="test-chamber" type="number" name="test-chamber" required/>
            </div>
            {message && (
              <p data-testid="error-msg">{message}</p>
            )}
            <div className={styles.inputGroup}>
              <input id="create" type="submit"/>
            </div>
          </form>
        </section>
        </>}
        { !authenticated && <h1 style={{color: "white"}}>Please log in to create a new subject</h1> }
      </Layout>
  );
}
