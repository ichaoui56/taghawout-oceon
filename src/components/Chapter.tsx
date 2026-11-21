type Props = { chapter: { n: string; align: "left" | "right"; kicker: string; title: string; body: string } };

export default function Chapter({ chapter }: Props) {
  return (
    <article className={`film-chapter film-chapter--${chapter.align}`}>
      <p className="film-chapter__eyebrow"><span>{chapter.n}</span><i aria-hidden="true" />{chapter.kicker}</p>
      <h2>{chapter.title}</h2>
      <p className="film-chapter__body">{chapter.body}</p>
      <span className="film-chapter__accent" aria-hidden="true" />
    </article>
  );
}
