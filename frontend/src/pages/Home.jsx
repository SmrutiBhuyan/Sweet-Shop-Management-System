import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Paper,
  InputBase,
  Divider,
  alpha
} from '@mui/material';
import {
  Search,
  LocalShipping,
  Star,
  Cake,
  ShoppingCart,
  ArrowForward,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { sweetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Color palette based on the provided image
const colors = {
  primary: '#FF6B8B', // Pink from the image
  secondary: '#4ECDC4', // Teal accent
  dark: '#2C3E50', // Dark blue
  light: '#F8F9FA', // Light background
  gold: '#FFD700', // Gold for accents
  chocolate: '#8B4513', // Chocolate brown
  candy: '#FF69B4' // Candy pink
};

const Home = () => {
  const [featuredSweets, setFeaturedSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Fetch featured sweets on component mount
  useEffect(() => {
    fetchFeaturedSweets();
  }, []);

  const fetchFeaturedSweets = async () => {
    try {
      setLoading(true);
      const response = await sweetAPI.getFeatured();
      setFeaturedSweets(response.sweets || []);
    } catch (error) {
      console.error('Error fetching featured sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.light }}>
      {/* ==================== HERO SECTION ==================== */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.candy} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.1)
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.1)
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  SWEETS & SAVOURIES
                </Typography>
                
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 300,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 4,
                    color: alpha('#fff', 0.9)
                  }}
                >
                  For Every Reason and Season
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.1rem',
                    mb: 4,
                    color: alpha('#fff', 0.8),
                    maxWidth: 500
                  }}
                >
                  Indulge in our exquisite collection of handcrafted sweets and savouries. 
                  From traditional favorites to modern delights, we have something special for every occasion.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      component={Link}
                      to="/sweets"
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: colors.secondary,
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#3DBBB4'
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      EXPLORE SWEETS
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      component={Link}
                      to="/contact"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: alpha('#fff', 0.1)
                        }
                      }}
                    >
                      ENQUIRE NOW
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: 20,
                      bottom: 20,
                      bgcolor: colors.gold,
                      borderRadius: 4,
                      zIndex: 0
                    }
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Sweet Shop Display"
                    sx={{
                      width: '100%',
                      height: 400,
                      objectFit: 'cover',
                      borderRadius: 4,
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================== FEATURED SWEETS SECTION ==================== */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: colors.dark,
                mb: 2
              }}
            >
              Featured Delights
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem'
              }}
            >
              Discover our handpicked selection of most loved sweets and savouries
            </Typography>
          </motion.div>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography>Loading featured sweets...</Typography>
          </Box>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Grid container spacing={4}>
              {featuredSweets.map((sweet, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={sweet._id}>
                  <motion.div variants={fadeInUp}>
                    <SweetCard sweet={sweet} index={index} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {!loading && featuredSweets.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No featured sweets available at the moment
            </Typography>
          </Box>
        )}
      </Container>

      {/* ==================== CATEGORIES SECTION ==================== */}
      <Box sx={{ bgcolor: alpha(colors.primary, 0.05), py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: colors.dark,
                  mb: 2
                }}
              >
                Our Categories
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: '1.1rem'
                }}
              >
                Explore sweets by category
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={3}>
            {[
              { name: 'Chocolates', icon: '🍫', color: colors.chocolate, count: 24 },
              { name: 'Cakes', icon: '🎂', color: colors.primary, count: 18 },
              { name: 'Pastries', icon: '🥐', color: colors.secondary, count: 32 },
              { name: 'Candies', icon: '🍬', color: colors.candy, count: 45 },
              { name: 'Cookies', icon: '🍪', color: '#D2691E', count: 28 },
              { name: 'Traditional', icon: '🎎', color: colors.gold, count: 36 }
            ].map((category, index) => (
              <Grid item xs={6} sm={4} md={2} key={category.name}>
                <motion.div
                  whileHover={{ y: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    component={Link}
                    to={`/sweets?category=${category.name.toLowerCase()}`}
                    sx={{
                      textDecoration: 'none',
                      bgcolor: 'white',
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{ fontSize: '2.5rem', mb: 1 }}
                    >
                      {category.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: category.color,
                        mb: 0.5
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {category.count} items
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==================== CTA SECTION ==================== */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.dark} 0%, #1a2530 100%)`,
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
              >
                Ready to Sweeten Your Day?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.1rem',
                  mb: 4,
                  color: alpha('#fff', 0.8),
                  maxWidth: 600
                }}
              >
                Join thousands of happy customers who have experienced the joy of our sweets.
                Sign up today and get 10% off your first order!
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' } }}>
                {user ? (
                  <Button
                    component={Link}
                    to="/sweets"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: colors.primary,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#FF5262'
                      }
                    }}
                  >
                    SHOP NOW
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: colors.primary,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#FF5262'
                      }
                    }}
                  >
                    SIGN UP FREE
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

// Sweet Card Component for Homepage
const SweetCard = ({ sweet, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={sweet.imageUrl}
          alt={sweet.name}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2
          }}
        >
          <IconButton
            onClick={() => setIsFavorite(!isFavorite)}
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            {isFavorite ? (
              <Favorite sx={{ color: colors.primary }} />
            ) : (
              <FavoriteBorder sx={{ color: colors.dark }} />
            )}
          </IconButton>
        </Box>

        {sweet.discount > 0 && (
          <Chip
            label={`${sweet.discount}% OFF`}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: colors.secondary,
              color: 'white',
              fontWeight: 600
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: colors.dark,
              flexGrow: 1
            }}
          >
            {sweet.name}
          </Typography>
          
          <Chip
            label={sweet.category}
            size="small"
            sx={{
              bgcolor: alpha(colors.primary, 0.1),
              color: colors.primary,
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {sweet.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box>
            {sweet.discount > 0 ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.primary,
                    fontWeight: 700,
                    display: 'inline-block',
                    mr: 1
                  }}
                >
                  ${(sweet.price * (1 - sweet.discount / 100)).toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'line-through',
                    display: 'inline-block'
                  }}
                >
                  ${sweet.price.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary,
                  fontWeight: 700
                }}
              >
                ${sweet.price.toFixed(2)}
              </Typography>
            )}
          </Box>

          <Chip
            icon={<Cake />}
            label={sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
            size="small"
            sx={{
              bgcolor: sweet.quantity > 0 ? alpha(colors.secondary, 0.1) : alpha('#ff6b6b', 0.1),
              color: sweet.quantity > 0 ? colors.secondary : colors.primary,
              fontWeight: 500
            }}
          />
        </Box>
      </CardContent>

      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          component={Link}
          to={`/sweets/${sweet._id}`}
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          sx={{
            bgcolor: colors.primary,
            '&:hover': {
              bgcolor: '#FF5262'
            }
          }}
        >
          {sweet.quantity > 0 ? 'Add to Cart' : 'View Details'}
        </Button>
      </Box>
    </Card>
  );
};

export default Home;