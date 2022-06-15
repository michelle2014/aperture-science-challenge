import React, { useEffect, useState } from 'react';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { parseCookies, resolveApiHost } from "../helpers/";
import useForm from '../helpers/useForm';
import validate from '../helpers/validate';
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

  const createSubject = async (event: any) => {

    try {
        await axios.post(`${api}/graphql`, {
          query: `
          mutation ($name: String!, $date_of_birth: DateTime!, $score: Int!, $alive: Boolean!, $test_chamber: Int!, $created_at: DateTime!) {
            createSubject (name: $name, date_of_birth: $date_of_birth, score: $score, alive: $alive, test_chamber: $test_chamber, created_at: $created_at) {
              name
              date_of_birth
              score
              alive
              test_chamber
              created_at
            }
          }`,
          variables:
            {
              name:event.target.name.value,
              date_of_birth:event.target.dob.value,              
              score:parseInt(event.target.score.value, 10),
              alive:(event.target.alive.value === "Y")? true: false,
              test_chamber:parseInt(event.target.chamber.value, 10),
              created_at: new Date().toISOString().substring(0,19).replace('T', ' ')},
          withCredentials: true,
        }).then(res => {
            console.log(res);
            router.push('/subjects');
          })
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

  const { values, errors, handleInputChange, handleSubmit, validateInputs } = useForm(createSubject, validate);

  return (
    <Layout>
      { authenticated && 
      <>
      <h1>Create new subject</h1>
      <section className={styles.content}>
          <form id="create-subject" onSubmit={handleSubmit} data-testid="create-subject-form">
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <input 
                onChange={handleInputChange} 
                onBlur={validateInputs} 
                className={errors.name ? styles.danger : ""}
                value={values.name || ''} 
                id="name" 
                type="text" 
                name="name" 
                required/>
            </div>
            <div>{errors.name && (<p style={{color: 'red'}}>{errors.name}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="dob">DOB</label>
              <input 
                onChange={handleInputChange} 
                onBlur={validateInputs} 
                className={errors.dob ? styles.danger : ""} 
                value={values.dob || ''} 
                id="dob" 
                type="text" 
                name="dob" 
                required/>
            </div>
            <div>{errors.dob && (<p style={{color: 'red'}}>{errors.dob}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="score">Score</label>
              <input 
                onChange={handleInputChange} 
                onBlur={validateInputs} 
                className={errors.score ? styles.danger : ""} 
                value={values.score || ''} 
                id="score" 
                type="number" 
                name="score" 
                required/>
            </div>
            <div>{errors.score && (<p style={{color: 'red'}}>{errors.score}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="alive">Alive</label>
              <input 
                onChange={handleInputChange} 
                onBlur={validateInputs} 
                className={errors.alive ? styles.danger : ""} 
                value={values.alive || ''} 
                id="alive" 
                type="text" 
                name="alive" 
                required/>
            </div>
            <div>{errors.alive && (<p style={{color: 'red'}}>{errors.alive}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="chamber">Chamber</label>
              <input 
                onChange={handleInputChange} 
                onBlur={validateInputs} 
                className={errors.chamber ? styles.danger : ""} 
                value={values.chamber || ''} 
                id="chamber" 
                type="number" 
                name="chamber" 
                required/>
            </div>
            <div>{errors.chamber && (<p style={{color: 'red'}}>{errors.chamber}</p>)}</div>
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
