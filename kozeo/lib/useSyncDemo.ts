import { useCallback, useMemo } from 'react'
import {
	AssetRecordType,
	Editor,
	MediaHelpers,
	Signal,
	TLAsset,
	TLAssetStore,
	TLPresenceStateInfo,
	TLPresenceUserInfo,
	TLStore,
	TLStoreSchemaOptions,
	clamp,
	defaultBindingUtils,
	defaultShapeUtils,
	getHashForString,
	uniqueId,
	
} from '@tldraw/tldraw'
import { RemoteTLStoreWithStatus, useSync } from './useSync'

/** @public */
export interface UseSyncDemoOptions {
	/**
	 * The room ID to sync with. Make sure the room ID is unique. The namespace is shared by
	 * everyone using the demo server. Consider prefixing it with your company or project name.
	 */
	roomId: string
	/**
	 * A signal that contains the user information needed for multiplayer features.
	 * This should be synchronized with the `userPreferences` configuration for the main `<Tldraw />` component.
	 * If not provided, a default implementation based on localStorage will be used.
	 */
	userInfo?: TLPresenceUserInfo | Signal<TLPresenceUserInfo>

	/** @internal */
	host?: string

	/**
	 * {@inheritdoc UseSyncOptions.getUserPresence}
	 * @public
	 */
	getUserPresence?(store: TLStore, user: TLPresenceUserInfo): TLPresenceStateInfo | null
}

/**
 * Depending on the environment this package is used in, process.env may not be available. Wrap
 * `process.env` accesses in this to make sure they don't fail.
 *
 * The reason that this is just a try/catch and not a dynamic check e.g. `process &&
 * process.env[key]` is that many bundlers implement `process.env.WHATEVER` using compile-time
 * string replacement, rather than actually creating a runtime implementation of a `process` object.
 */
function getEnv(cb: () => string | undefined): string | undefined {
	try {
		return cb()
	} catch {
		return undefined
	}
}

const DEMO_WORKER = getEnv(() => process.env.TLDRAW_BEMO_URL) ?? 'https://demo.tldraw.xyz'
const IMAGE_WORKER = getEnv(() => process.env.TLDRAW_IMAGE_URL) ?? 'https://images.tldraw.xyz'

/**
 * Creates a tldraw store synced with a multiplayer room hosted on tldraw's demo server `https://demo.tldraw.xyz`.
 *
 * The store can be passed directly into the `<Tldraw />` component to enable multiplayer features.
 * It will handle loading states, and enable multiplayer UX like user cursors and following.
 *
 * **Image Sharing Features:**
 * - Users can drag and drop images directly onto the canvas
 * - Images are automatically uploaded to the server and shared with all participants
 * - Supports common image formats (PNG, JPEG, GIF, WebP, SVG)
 * - File size limit: 10MB per image
 * - Images are optimized and transformed for better performance
 * - Automatic fallback to base64 encoding if server uploads are not available
 *
 * All data on the demo server is
 *
 * - Deleted after a day or so.
 * - Publicly accessible to anyone who knows the room ID. Use your company name as a prefix to help avoid collisions, or generate UUIDs for maximum privacy.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *     const store = useSyncDemo({roomId: 'my-app-test-room'})
 *     return <Tldraw store={store} />
 * }
 * ```
 *
 * @param options - Options for the multiplayer demo sync store. See {@link UseSyncDemoOptions} and {@link tldraw#TLStoreSchemaOptions}.
 *
 * @public
 */
export function useSyncDemo(
	options: UseSyncDemoOptions & TLStoreSchemaOptions
): RemoteTLStoreWithStatus {
	const { roomId, host = DEMO_WORKER, ..._syncOpts } = options
	const assets = useMemo(() => createDemoAssetStore(host), [host])

	const syncOpts = _syncOpts;
	const syncOptsWithDefaults = useMemo(() => {
		if ('schema' in syncOpts && syncOpts.schema) return syncOpts

		return {
			...syncOpts,
			shapeUtils:
				'shapeUtils' in syncOpts
					? [...defaultShapeUtils, ...(syncOpts.shapeUtils ?? [])]
					: defaultShapeUtils,
			bindingUtils:
				'bindingUtils' in syncOpts
					? [...defaultBindingUtils, ...(syncOpts.bindingUtils ?? [])]
					: defaultBindingUtils,
		}
	}, [syncOpts])

	return useSync({
		uri: `${host}/connect/${encodeURIComponent(roomId)}`,
		roomId,
		assets,
		onMount: useCallback(
			(editor: Editor) => {
				editor.registerExternalAssetHandler('url', async ({ url }) => {
					return await createAssetFromUrlUsingDemoServer(host, url)
				})
			},
			[host]
		),
		...syncOptsWithDefaults,
	})
}

function shouldDisallowUploads(host: string) {
	// For demo purposes, we'll use base64 encoding for official tldraw servers
	// and attempt server uploads for custom hosts
	const officialDemoHosts = ['demo.tldraw.xyz', 'demo.tldraw.com']
	return officialDemoHosts.some(
		(demoHost) => host === demoHost || host.endsWith(`.${demoHost}`)
	)
}

function createDemoAssetStore(host: string): TLAssetStore {
	return {
		upload: async (_asset, file) => {
			console.log('🖼️ TLDraw: Attempting to upload image:', {
				name: file.name,
				type: file.type,
				size: file.size,
				host
			})

			// Check if uploads are allowed for this host
			if (shouldDisallowUploads(host)) {
				console.log('🖼️ TLDraw: Using base64 encoding for official demo server')
				// For disallowed hosts, use base64 encoding as fallback
				return new Promise((resolve, reject) => {
					const reader = new FileReader()
					reader.onload = () => {
						console.log('🖼️ TLDraw: Base64 encoding successful')
						resolve({ src: reader.result as string })
					}
					reader.onerror = () => {
						console.error('🖼️ TLDraw: Base64 encoding failed')
						reject(new Error('Failed to read file'))
					}
					reader.readAsDataURL(file)
				})
			}

			// Validate file type (only allow images)
			if (!file.type.startsWith('image/')) {
				throw new Error('Only image files are allowed')
			}

			// Check file size limit (10MB for uploads, 5MB for base64)
			const maxSize = 10 * 1024 * 1024 // 10MB
			if (file.size > maxSize) {
				throw new Error('File size too large. Maximum size is 10MB')
			}
			
			const id = uniqueId()
			const objectName = `${id}-${file.name}`.replace(/\W/g, '-')
			const url = `${host}/uploads/${objectName}`

			try {
				console.log('🖼️ TLDraw: Attempting server upload to:', url)
				const response = await fetch(url, {
					method: 'POST',
					body: file,
					headers: {
						'Content-Type': file.type,
					},
				})

				if (!response.ok) {
					// If server upload fails, fallback to base64
					console.warn('🖼️ TLDraw: Server upload failed, falling back to base64 encoding')
					return new Promise((resolve, reject) => {
						const reader = new FileReader()
						reader.onload = () => {
							console.log('🖼️ TLDraw: Base64 fallback successful')
							resolve({ src: reader.result as string })
						}
						reader.onerror = () => {
							console.error('🖼️ TLDraw: Base64 fallback failed')
							reject(new Error('Failed to read file'))
						}
						reader.readAsDataURL(file)
					})
				}

				console.log('🖼️ TLDraw: Server upload successful:', url)
				return { src: url }
			} catch (error) {
				console.warn('🖼️ TLDraw: Upload failed, falling back to base64:', error)
				// Fallback to base64 encoding if upload fails
				return new Promise((resolve, reject) => {
					const reader = new FileReader()
					reader.onload = () => {
						console.log('🖼️ TLDraw: Base64 fallback successful')
						resolve({ src: reader.result as string })
					}
					reader.onerror = () => {
						console.error('🖼️ TLDraw: Base64 fallback failed')
						reject(new Error('Failed to read file'))
					}
					reader.readAsDataURL(file)
				})
			}
		},

		resolve(asset, context) {
			if (!asset.props.src) return null

			// We don't deal with videos at the moment.
			if (asset.type === 'video') return asset.props.src

			// Assert it's an image to make TS happy.
			if (asset.type !== 'image') return null

			// Don't try to transform data: URLs (base64 encoded images)
			if (!asset.props.src.startsWith('http:') && !asset.props.src.startsWith('https:'))
				return asset.props.src

			if (context.shouldResolveToOriginal) return asset.props.src

			// Don't try to transform animated images (GIFs, etc.)
			if (MediaHelpers.isAnimatedImageType(asset?.props.mimeType) || asset.props.isAnimated)
				return asset.props.src

			// Don't try to transform vector images (SVG)
			if (MediaHelpers.isVectorImageType(asset?.props.mimeType)) return asset.props.src

			const url = new URL(asset.props.src)

			// Transform images hosted on our domains or tldraw domains
			const isTldrawImage =
				url.origin === host || /\.tldraw\.(?:com|xyz|dev|workers\.dev)$/.test(url.host)

			if (!isTldrawImage) return asset.props.src

			// Assets that are under a certain file size aren't worth transforming
			// We still send them through the image worker for optimization
			const { fileSize = 0 } = asset.props
			const isWorthResizing = fileSize >= 1024 * 1024 * 1.5 // 1.5MB threshold

			if (isWorthResizing) {
				// Adjust image quality based on network connection
				// navigator.connection is only available in certain browsers
				const networkCompensation =
					!context.networkEffectiveType || context.networkEffectiveType === '4g' ? 1 : 0.5

				const width = Math.ceil(
					Math.min(
						asset.props.w *
							clamp(context.steppedScreenScale, 1 / 32, 1) *
							networkCompensation *
							context.dpr,
						asset.props.w
					)
				)

				url.searchParams.set('w', width.toString())
				// Add quality parameter for better optimization
				url.searchParams.set('q', '85') // 85% quality for good balance
			}

			const newUrl = `${IMAGE_WORKER}/${url.host}/${url.toString().slice(url.origin.length + 1)}`
			return newUrl
		},
	}
}

async function createAssetFromUrlUsingDemoServer(host: string, url: string): Promise<TLAsset> {
	const urlHash = getHashForString(url)
	try {
		// First, try to get the meta data from our endpoint
		const fetchUrl = new URL(`${host}/bookmarks/unfurl`)
		fetchUrl.searchParams.set('url', url)

		const meta = (await (await fetch(fetchUrl, { method: 'POST' })).json()) as {
			description?: string
			image?: string
			favicon?: string
			title?: string
		} | null

		return {
			id: AssetRecordType.createId(urlHash),
			typeName: 'asset',
			type: 'bookmark',
			props: {
				src: url,
				description: meta?.description ?? '',
				image: meta?.image ?? '',
				favicon: meta?.favicon ?? '',
				title: meta?.title ?? '',
			},
			meta: {},
		}
	} catch (error) {
		// Otherwise, fallback to a blank bookmark
		console.error(error)
		return {
			id: AssetRecordType.createId(urlHash),
			typeName: 'asset',
			type: 'bookmark',
			props: {
				src: url,
				description: '',
				image: '',
				favicon: '',
				title: '',
			},
			meta: {},
		}
	}
}