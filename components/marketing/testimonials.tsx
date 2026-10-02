"use client";

import { UiIcon } from "@/components/ui-icon";
import { useState } from "react";
import styles from "./testimonials.module.css";

const stories = [
  {
    name: "Shalom",
    detail: "Software Engineer · Endorsed 2023",
    journey: "First-time success",
    outcome: "Endorsed on the first attempt",
    text: "Grace made the experience so much easier. She boosted my confidence and reassured me throughout the process. Even when I made a mistake, she told me not to worry and shared her own experience. After I submitted, she kept encouraging me to stay calm and be patient. Two weeks later, I received my endorsement on my first attempt!",
  },
  {
    name: "James",
    detail: "Software Engineer · Endorsed 2024",
    journey: "A new chapter with family",
    outcome: "Endorsed on the first attempt",
    text: "Thank you so much, Grace, for sharing your Global Talent endorsement journey with me. The document you shared was inspiring and helpful. I got my endorsement on my first attempt, and I’m now in the UK with my family!",
  },
  {
    name: "Stanley",
    detail: "Founder · Endorsed 2025",
    journey: "From rejection to endorsement",
    outcome: "Endorsed after reapplying",
    text: "I was rejected the first time. Grace helped me tell my story better, remove unnecessary information and review my documents countless times. She encouraged me to apply again, and when I did, I got endorsed in a week! Thank you, Grace, for supporting me through the journey.",
  },
  {
    name: "Tosin",
    detail: "Now in the UK",
    journey: "Support through every step",
    outcome: "Endorsed on the first attempt",
    text: "Grace guided me through my documentation and visa application. With her support, I got my endorsement on my first attempt. I’m now in the UK. Thank you, Grace, for helping me through the process!",
  },
  {
    name: "Thuile",
    detail: "Document review & appeal guidance",
    journey: "A successful appeal",
    outcome: "Endorsed after an appeal",
    text: "After my application was rejected, I paid Grace to review my documents. She walked me through two options: appeal or reapply. I chose to appeal, and I got endorsed! Thank you, Grace, for reviewing my documents and helping me understand my next steps.",
  },
  {
    name: "Anonymous",
    detail: "Resources & recommendations",
    journey: "Support worth sharing",
    outcome: "Endorsed using Grace’s resources",
    text: "I used Grace’s resources for my application and got endorsed! I was so happy with how helpful they were that I recommended her to three people at once.",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const move = (direction: number) => setActive((current) => (current + direction + stories.length) % stories.length);

  return (
    <section id="testimonials" className={`section ${styles.section}`} aria-labelledby="testimonials-title">
      <div className="container">
        <div className={`section-heading ${styles.heading}`}>
          <div>
            <p className="eyebrow">CLIENT STORIES</p>
            <h2 id="testimonials-title">Big moves.<br /><em>Personal stories.</em></h2>
          </div>
        </div>
        <div className={styles.showcase}>
          <div className={styles.storyPicker} role="group" aria-label="Choose a client story">
            {stories.map((story, index) => (
              <button
                key={story.name}
                type="button"
                className={styles.storyButton}
                aria-pressed={active === index}
                aria-controls="client-story-panel"
                onClick={() => setActive(index)}
              >
                <span className={styles.initial} aria-hidden="true">{story.name === "Anonymous" ? "✦" : story.name[0]}</span>
                <span className={styles.person}><strong>{story.name}</strong><span>{story.journey}</span></span>
                <span className={styles.pickerArrow} aria-hidden="true"><UiIcon name="arrow-up-right" /></span>
              </button>
            ))}
          </div>
          <div className={styles.spotlight}>
            <div className={styles.spotlightTop}>
              <span className={styles.storyLabel}>THE NEXT CHAPTER</span>
              <span className={styles.index} aria-hidden="true">0{active + 1} / 0{stories.length}</span>
            </div>
            <div id="client-story-panel" className={styles.panel} aria-live="polite" aria-atomic="true">
              {stories.map((story, index) => <figure key={story.name} className={`${styles.story}${active === index ? ` ${styles.activeStory}` : ""}`} aria-hidden={active !== index}>
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                <blockquote><p>{story.text}</p></blockquote>
                <figcaption className={styles.caption}>
                  <div><strong>{story.name}</strong><span>{story.detail}</span></div>
                  <span className={styles.outcome}><span aria-hidden="true">✓</span>{story.outcome}</span>
                </figcaption>
              </figure>)}
            </div>
            <div className={styles.controls}>
              <div className={styles.progress} aria-hidden="true">
                {stories.map((story, index) => <span key={story.name} className={index === active ? styles.current : undefined} />)}
              </div>
              <div className={styles.arrows}>
                <button type="button" onClick={() => move(-1)} aria-label="Previous client story" aria-controls="client-story-panel"><UiIcon name="arrow-left" /></button>
                <button type="button" onClick={() => move(1)} aria-label="Next client story" aria-controls="client-story-panel"><UiIcon name="arrow-right" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
