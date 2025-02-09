import { useState } from 'react';

import { Colour } from './util.ts';
import FpsCounter from './FpsCounter.tsx';
import ColourPicker from './ColourPicker.tsx';
import BackgroundGradient from './BackgroundGradient.tsx';
import BackgroundGrain from './BackgroundGrain.tsx';
import PauseButton from './PauseButton.tsx';
import './App.css';
import NightModeButton from './NightModeButton.tsx';

const BASE_COLOURS: Colour[] = [
  [163, 232, 255],
  [236, 229, 255],
  [255, 214, 226],
  [255, 184, 201],
]

// const BASE_COLOURS = [
//   [220, 142, 190],
//   [254, 190, 210],
//   [252, 224, 255],
// ];

// const BASE_COLOURS = [
//   [0, 212, 215],
//   [74, 9, 135],
//   [42, 20, 76],
// ];

function App() {
  const [colours, setColours] = useState<Colour[]>(BASE_COLOURS);
  const [paused, setPaused] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  return (
    <>
      <section className="meta">
        <ColourPicker colours={colours} setColours={setColours} />
        <FpsCounter />
      </section>

      <main className="page">
        <header className="header">
          <div className="header_actions">
            <NightModeButton nightMode={nightMode} setNightMode={setNightMode} />
            <PauseButton paused={paused} setPaused={setPaused} />
          </div>
          <nav className="menu">
            <ul className="menu_list">
              <li className="menu_item"><a href="writing">Writing</a></li>
              <li className="menu_item"><a href="projects">Projects</a></li>
              <li className="menu_item"><a href="about">About</a></li>
            </ul>
          </nav>
        </header>
        <div>
          <article className="page_segment intro">
            <h1>Pete West</h1>
            <p>
              I'm Pete, known as <a href="https://bsky.app/profile/peterjwest.bsky.social">@peterjwest</a> online.
              I work as a full-stack developer, and am interested in many nerdy things.
              Currently I want to learn more about security and 3D rendering.
            </p>
          </article>

          <article className="page_segment posts">
            <h2>Writing</h2>
            <ul className="posts_list">
              <li className="posts_list_item">
                <article className="post">
                  <section className="post_body">
                    <h3 className="post_title"><a href="/writing/a">Post a</a></h3>
                    <p className="post_subtitle">Something or other</p>
                  </section>
                  <time className="post_date" dateTime="2025-01-03">03 Jan 2025</time>
                </article>
              </li>

              <li className="posts_list_item">
                <article className="post">
                  <section className="post_body">
                    <h3 className="post_title"><a href="/writing/b">Post b</a></h3>
                    <p className="post_subtitle">Another different thing</p>
                  </section>
                  <time className="post_date" dateTime="2024-11-12">12 Dec 2024</time>
                </article>
              </li>

              <li className="posts_list_item">
                <article className="post">
                  <section className="post_body">
                    <h3 className="post_title"><a href="/writing/c">Post c</a></h3>
                    <p className="post_subtitle">Yet another thing</p>
                  </section>
                  <time className="post_date" dateTime="2024-08-17">17 Aug 2024</time>
                </article>
              </li>
            </ul>
          </article>
        </div>

        <footer className="footer">
          <p className="footer_inner">
            Talk to me on <a href="https://bsky.app/profile/peterjwest.bsky.social">Bluesky</a>, send me an <a href= "mailto:peterjwest3@gmail.com">email</a>, read more <a
              href="about">about me.</a>
          </p>
        </footer>
      </main>

      <BackgroundGradient colours={colours} paused={paused} />
      <BackgroundGrain />
    </>
  );
}

export default App;
