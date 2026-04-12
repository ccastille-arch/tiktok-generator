'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import TabNav from '@/components/TabNav'
import GeneratorTab from '@/components/GeneratorTab'
import TemplatesTab from '@/components/TemplatesTab'
import HashtagsTab from '@/components/HashtagsTab'
import AnalyticsTab from '@/components/AnalyticsTab'
import UploadTab from '@/components/UploadTab'

export type Tab = 'generate' | 'templates' | 'hashtags' | 'analytics' | 'upload'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

  return (
    <div className="hero-gradient min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <TabNav active={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'generate' && <GeneratorTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'hashtags' && <HashtagsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'upload' && <UploadTab />}
        </div>
      </div>
    </div>
  )
}
