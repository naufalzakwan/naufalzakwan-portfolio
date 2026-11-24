type StoryPhotoDetails = Readonly<{
  alt: string;
  aspectRatio: `${number} / ${number}`;
  objectPosition: string;
  directory: `/images/${string}/`;
}>;

export type StoryPhoto = StoryPhotoDetails & (
  | Readonly<{ status: "placeholder"; src: null }>
  | Readonly<{ status: "approved"; src: `/${string}`; width: number; height: number }>
);

export type StoryChapter = Readonly<{
  id: string;
  heading: string;
  paragraph: string;
  photo: StoryPhoto;
}>;
