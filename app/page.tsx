import { copy } from '@/locale';
import { Typography } from '@/components/Typography';
import { ProductCard } from '@/components/ProductCard';
import { getPublishedProducts } from '@/api/getProducts';

export const dynamic = 'force-dynamic';

const styles = {
  container: 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16',
  title: 'text-center',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
};

const titleLabel = copy.home.title;
const emptyLabel = copy.home.empty;

const Home = async () => {
  const publishedProducts = await getPublishedProducts();

  const isEmpty = !publishedProducts.length;

  return (
    <main className={styles.container}>
      <Typography as="h1" variant="title" className={styles.title}>
        {titleLabel}
      </Typography>

      {isEmpty ? (
        <Typography as="p" variant="muted" className={styles.title}>
          {emptyLabel}
        </Typography>
      ) : (
        <div className={styles.grid}>
          {publishedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;
