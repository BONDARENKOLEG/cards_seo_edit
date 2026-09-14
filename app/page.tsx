import { copy } from "@/locale";
import { Typography } from "@/components/typography";
import { spacing } from "@/lib/spacing";

const styles = {
  container: `mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-2 px-${spacing.normal} py-${spacing.xl} text-center`,
};

const titleLabel = copy.home.title;
const placeholderLabel = copy.home.placeholder;

const Home = () => {
  return (
    <main className={styles.container}>
      <Typography as="h1" variant="title">
        {titleLabel}
      </Typography>
      <Typography as="p" variant="muted">
        {placeholderLabel}
      </Typography>
    </main>
  );
};

export default Home;
