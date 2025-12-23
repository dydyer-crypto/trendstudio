-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-8fsm78964c1t_viralix_images',
  'app-8fsm78964c1t_viralix_images',
  true,
  1048576, -- 1MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public upload access (no login required)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-8fsm78964c1t_viralix_images');

-- Create policy for public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-8fsm78964c1t_viralix_images');

-- Create policy for public delete access (allow users to delete their uploads)
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-8fsm78964c1t_viralix_images');