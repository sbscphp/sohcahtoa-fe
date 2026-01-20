import { Button, Text, Stack, Group, TextInput, Textarea, Select, Badge, Card, Title, Divider } from '@mantine/core';

export default function CustomerPage() {
  return (
    <div className="min-h-screen p-8 bg-bg-card">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <Title order={1} className="mb-2 text-heading-200">
            Design Tokens Showcase
          </Title>
          <p className="text-lg text-body-text-100">
            Testing Mantine components and Tailwind classes with Figma design tokens
          </p>
        </div>

        {/* Primary Colors */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Primary Colors (Orange)</Title>
          <Group gap="md">
            <Button color="orange">Primary Button</Button>
            <Button color="orange" variant="light">Light</Button>
            <Button color="orange" variant="outline">Outline</Button>
            <Button color="orange" variant="subtle">Subtle</Button>
          </Group>
          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="w-20 h-20 bg-primary-400 rounded"></div>
            <div className="w-20 h-20 bg-primary-500 rounded"></div>
            <div className="w-20 h-20 bg-primary-600 rounded"></div>
            <div className="w-20 h-20 bg-primary-700 rounded"></div>
          </div>
        </Card>

        {/* System Colors */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">System Colors</Title>
          <Group gap="md">
            <Button color="red">Error</Button>
            <Button color="green">Success</Button>
            <Button color="yellow">Warning</Button>
          </Group>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge color="red">Error Badge</Badge>
            <Badge color="green">Success Badge</Badge>
            <Badge color="yellow">Warning Badge</Badge>
          </div>
        </Card>

        {/* Other Colors */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Other Color Palettes</Title>
          <Group gap="md">
            <Button color="blue">Dark Blue</Button>
            <Button color="cyan">Cyan</Button>
            <Button color="teal">Teal</Button>
            <Button color="lime">Green Light</Button>
            <Button color="violet">Purple</Button>
            <Button color="pink">Rose</Button>
          </Group>
          <div className="mt-4 grid grid-cols-6 gap-2">
            <div className="h-16 bg-blue-500 rounded"></div>
            <div className="h-16 bg-cyan-500 rounded"></div>
            <div className="h-16 bg-teal-500 rounded"></div>
            <div className="h-16 bg-lime-500 rounded"></div>
            <div className="h-16 bg-violet-500 rounded"></div>
            <div className="h-16 bg-pink-500 rounded"></div>
          </div>
        </Card>

        {/* Input Fields */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Input Fields</Title>
          <Stack gap="md" className="max-w-md">
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              description="Input with default styling"
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="Enter password"
              disabled
            />
            <Textarea
              label="Message"
              placeholder="Enter your message"
              rows={4}
            />
            <Select
              label="Country"
              placeholder="Select country"
              data={['USA', 'Canada', 'UK', 'Germany']}
            />
          </Stack>
        </Card>

        {/* Gray Scale */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Gray Scale</Title>
          <div className="flex gap-2 flex-wrap">
            <div className="w-16 h-16 bg-gray-25 rounded border border-gray-200"></div>
            <div className="w-16 h-16 bg-gray-50 rounded border border-gray-200"></div>
            <div className="w-16 h-16 bg-gray-100 rounded"></div>
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
            <div className="w-16 h-16 bg-gray-400 rounded"></div>
            <div className="w-16 h-16 bg-gray-500 rounded"></div>
            <div className="w-16 h-16 bg-gray-600 rounded"></div>
            <div className="w-16 h-16 bg-gray-700 rounded"></div>
            <div className="w-16 h-16 bg-gray-800 rounded"></div>
            <div className="w-16 h-16 bg-gray-900 rounded"></div>
          </div>
        </Card>

        {/* Text Colors */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Text Colors</Title>
          <Stack gap="xs">
            <Text size="xl" fw={700} className="text-heading-300">Heading 300 - Darkest</Text>
            <Text size="lg" fw={600} className="text-heading-200">Heading 200 - Medium</Text>
            <Text size="md" fw={500} className="text-heading-100">Heading 100 - Light</Text>
            <Text className="text-text-500">Text 500 - Body text</Text>
            <Text className="text-text-400">Text 400 - Secondary</Text>
            <Text className="text-text-300">Text 300 - Tertiary</Text>
            <Text className="text-text-200">Text 200 - Disabled</Text>
            <Text className="text-text-100">Text 100 - Very Light</Text>
          </Stack>
        </Card>

        {/* Background Colors */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Background Colors</Title>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded border border-gray-200 bg-bg-page">
              <Text size="sm" fw={500}>Page BG</Text>
            </div>
            <div className="p-4 rounded border border-gray-200 bg-bg-card">
              <Text size="sm" fw={500}>Card BG</Text>
            </div>
            <div className="p-4 rounded border border-gray-200 bg-bg-sidebar">
              <Text size="sm" fw={500}>Sidebar BG</Text>
            </div>
            <div className="p-4 rounded border border-gray-200 bg-bg-card-2">
              <Text size="sm" fw={500}>Card BG 2</Text>
            </div>
            <div className="p-4 rounded border border-gray-200 bg-bg-tabbar">
              <Text size="sm" fw={500}>Tab Bar BG</Text>
            </div>
            <div className="p-4 rounded border border-gray-200 bg-bg-checkbox">
              <Text size="sm" fw={500}>Checkbox BG</Text>
            </div>
          </div>
        </Card>

        {/* Links */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Links & Text</Title>
          <Stack gap="md">
            <Text>
              This is a paragraph with a{' '}
              <a 
                href="#" 
                className="underline text-primary-400 hover:text-primary-600"
              >
                primary link
              </a>{' '}
              and some regular text.
            </Text>
            <Group>
              <Button component="a" href="#" variant="subtle">
                Link Button
              </Button>
              <Button component="a" href="#" variant="light">
                Light Link
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Color Swatches */}
        <Card className="p-6 bg-bg-card">
          <Title order={2} className="mb-4 text-heading-200">Color Swatches</Title>
          <div className="space-y-6">
            <div>
              <Text size="sm" fw={500} className="mb-2">Primary Scale</Text>
              <div className="flex gap-1">
                {[0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className="h-12 flex-1 rounded"
                    style={{ backgroundColor: `var(--color-primary-${shade === 0 ? '00' : shade})` }}
                    title={`Primary ${shade}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Text size="sm" fw={500} className="mb-2">Blue Scale</Text>
              <div className="flex gap-1">
                {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className="h-12 flex-1 rounded"
                    style={{ backgroundColor: `var(--color-blue-${shade})` }}
                    title={`Blue ${shade}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
