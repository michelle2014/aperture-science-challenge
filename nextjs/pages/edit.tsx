import React, { useEffect, useState, useContext } from 'react';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { parseCookies, resolveApiHost } from "../helpers/";
import AppContext from "../components/appContext";
import Layout from "../components/layout";
import axios from 'axios';
import styles from '../styles/App.module.css';

Edit.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Edit(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol: string}) {
  const router = useRouter();
  const [ message, setFormMessage ] = useState('');
  const api = `${props.protocol}//${props.hostname}`;
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const context = useContext(AppContext);

  const edit = async (event: any) => {

    event.preventDefault();
    try {
        await axios.post(`${api}/graphql`, {
          query: `
          mutation ($id: ID!, $name: String!, $test_chamber: Int!, $date_of_birth: DateTime!, $score: Int!, $alive: Boolean!, $updated_at: DateTime!) {
            updateSubject (id: $id, name: $name, score: $score, test_chamber: $test_chamber, alive: $alive, date_of_birth: $date_of_birth, updated_at: $updated_at) {
              id
              name
              score
              test_chamber
              alive
              date_of_birth
              updated_at
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
              updated_at: new Date().toISOString().substring(0,19).replace('T', ' ')},
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
      <h1>Edit subject</h1>
      <section className={styles.content}>
          <form id="edit-subject" onSubmit={edit} data-testid="edit-subject-form">
            <div className={styles.inputGroup}>
              <label htmlFor="edit-id">ID</label>
              <input id="edit-id" defaultValue={context.session.id} type="number" name="edit-id" required disabled/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="edit-name">Name</label>
              <input id="edit-name" defaultValue={context.session.name} type="text" name="edit-name" required/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="edit-date-of-birth">DOB</label>
              <input id="edit-date-of-birth" defaultValue={context.session.date_of_birth} type="date" name="edit-date-of-birth" required/>
              <p>(example: 2022-06-03 02:13:21)</p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="edit-score">Score</label>
              <input id="edit-score" defaultValue={context.session.score} type="number" name="edit-score" required/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="edit-alive">Alive</label>
              <input id="edit-alive" defaultValue={context.session.alive} type="text" name="edit-alive" required/>
              <p>(please enter Y or N)</p>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="edit-test-chamber">Chamber</label>
              <input id="edit-test-chamber" defaultValue={context.session.test_chamber} type="number" name="edit-test-chamber" required/>
            </div>
            {message && (
              <p data-testid="error-msg">{message}</p>
            )}
            <div className={styles.inputGroup}>
              <input id="edit" type="submit"/>
            </div>
          </form>
        </section>
        </>}
        { !authenticated && <h1 style={{color: "white"}}>Please log in to edit a subject</h1>}
      </Layout>
  );
}
