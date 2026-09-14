import { Typography } from "@/components/typography";
import { styles } from "./admin.styles";
import { titleLabel, placeholderLabel } from "./admin.copy";

const AdminHome = () => {
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

export default AdminHome;
