-- ============================================
-- Seed: Example service catalog
-- Run manually or via supabase after migration
-- ============================================

-- NOTE: Replace stripe_product_id and stripe_price_id values
-- with real IDs from your Stripe Dashboard after creating products there.

insert into public.services (name, slug, description, category, pricing_type, stripe_product_id, is_active, display_order, metadata) values
(
  'Basic Website',
  'basic-website',
  'A professionally designed, responsive website built with modern technologies. Includes up to 5 pages, mobile optimization, SEO basics, and a contact form.',
  'website',
  'one_time',
  null, -- Set after creating in Stripe
  true,
  1,
  '{"pages": 5, "delivery_weeks": 3, "includes": ["Responsive design", "SEO basics", "Contact form", "Analytics setup"]}'
),
(
  'Custom Web Application',
  'custom-web-application',
  'A tailored web application built to your specifications. Full-stack development with modern frameworks, authentication, database design, and deployment.',
  'application',
  'custom',
  null,
  true,
  2,
  '{"includes": ["Custom architecture", "User authentication", "Database design", "Deployment & CI/CD", "3 months support"]}'
),
(
  'Monthly Consulting Retainer',
  'monthly-consulting',
  'Ongoing technical consulting and advisory services. Includes strategic guidance on architecture, technology choices, and development best practices.',
  'consulting',
  'recurring',
  null,
  true,
  3,
  '{"hours_per_month": 10, "includes": ["Architecture review", "Tech strategy", "Code review", "Priority support"]}'
),
(
  'AI Strategy Workshop',
  'ai-strategy-workshop',
  'A hands-on workshop for your team covering practical AI integration, tool selection, and workflow optimization. Tailored to your industry and current tech stack.',
  'workshop',
  'one_time',
  null,
  true,
  4,
  '{"duration_hours": 4, "max_participants": 15, "includes": ["Pre-workshop assessment", "Custom materials", "Follow-up action plan"]}'
),
(
  '1-on-1 Coaching',
  'coaching',
  'Personalized coaching sessions focused on technical leadership, AI literacy, and career development in an AI-driven landscape.',
  'coaching',
  'recurring',
  null,
  true,
  5,
  '{"sessions_per_month": 4, "session_minutes": 60, "includes": ["Weekly sessions", "Async support", "Resource library access"]}'
);

-- Example prices (replace stripe_price_id with real Stripe Price IDs)
-- You'll create these in Stripe Dashboard and update the IDs here

-- insert into public.service_prices (service_id, currency, amount, interval, stripe_price_id) values
-- ((select id from public.services where slug = 'basic-website'), 'nok', 5000000, null, 'price_xxx'),
-- ((select id from public.services where slug = 'basic-website'), 'eur', 500000, null, 'price_xxx'),
-- ((select id from public.services where slug = 'monthly-consulting'), 'nok', 1500000, 'month', 'price_xxx'),
-- ((select id from public.services where slug = 'monthly-consulting'), 'eur', 150000, 'month', 'price_xxx'),
-- ((select id from public.services where slug = 'ai-strategy-workshop'), 'nok', 2500000, null, 'price_xxx'),
-- ((select id from public.services where slug = 'coaching'), 'nok', 800000, 'month', 'price_xxx');
